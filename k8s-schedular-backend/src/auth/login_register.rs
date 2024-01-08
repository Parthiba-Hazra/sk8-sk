use neo4rs::*;
use actix_web::{web, HttpResponse, Responder, error::ErrorUnauthorized};
use serde::{Serialize, Deserialize};
use actix_session::Session;
use serde_json::json;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use uuid::Uuid;

const NEO4J_URI: &str = "bolt://127.0.0.1:7687";
const NEO4J_USER: &str = "neo4j";
const NEO4J_PASS: &str = "neo12345";

#[derive(serde::Serialize)]
pub struct SessionDetails {
    user_id: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: String,
    name: String,
    email: String,
    password_hash: String,
}

#[derive(serde::Deserialize)]
pub struct LoginData {
    email: String,
    password: String,
}

#[derive(serde::Deserialize)]
pub struct RegisterData {
    name: String,
    email: String,
    password: String,
}

pub fn check_auth(session: &Session) -> Result<u32, actix_web::Error> {
    match session.get::<u32>("user_id").unwrap() {
        Some(user_id) => Ok(user_id),
        None => Err(ErrorUnauthorized("User not logged in.")),
    }
}

pub async fn login(data: web::Json<LoginData>, session: Session) -> impl Responder {
    match authenticate_user(data).await {
        Ok(user) => {
            // Store user_id in the session upon successful login
            session.insert("user_id", user.id.clone()).unwrap();
            session.renew();
            HttpResponse::Ok().json(user)
        }
        Err(_) => HttpResponse::Unauthorized().json(json!({ "error": "Invalid credentials" })),
    }
}

pub async fn register(data: web::Json<RegisterData>) -> impl Responder {
    match register_user(data).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::BadRequest().json(json!({ "error": "User with this email already exists" })),
    }
}

async fn authenticate_user(data: web::Json<LoginData>) -> Result<User, neo4rs::Error> {
    let graph = create_neo4j_client().await?;

    let query = Query::new(
        "MATCH (u:User) WHERE u.email = $email RETURN u".to_string()
        )
        .param("email", &*data.email);

    let result = graph.execute(query).await;

    if let Ok(mut result) = result {
        while let Ok(Some(row)) = result.next().await {
            let node: Node = row.get("u").unwrap();
            let password_hash: String = node.get("password_hash").unwrap();

            if verify_password(&data.password, &password_hash) {
                return Ok(User {
                    id: node.get("id").unwrap(),
                    name: node.get("name").unwrap(),
                    email: node.get("email").unwrap(),
                    password_hash: node.get("password_hash").unwrap(),
                });
            }
        }
    }

    Err(neo4rs::Error::AuthenticationError("Invalid credentials".to_owned()))
}

async fn register_user(data: web::Json<RegisterData>) -> Result<User, neo4rs::Error> {
    let graph = create_neo4j_client().await?;

    if username_exists(&graph, &data.name).await {
        println!("Error: Username '{}' is already taken", data.name);
        return Err(neo4rs::Error::AuthenticationError("Username already taken".to_owned()));
    }

    if email_exists(&graph, &data.email).await {
        println!("Error: Email '{}' is already taken", data.name);
        return Err(neo4rs::Error::AuthenticationError("Email already exist".to_owned()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(data.password.as_bytes(), &salt)
        .map_err(|err| neo4rs::Error::AuthenticationError(err.to_string()))?
        .to_string();

    let id = Uuid::new_v4().to_string();

    let query = Query::new(
        "CREATE (u:User {id: $id, name: $name, email: $email, password_hash: $password_hash}) RETURN u".to_string()
    )
    .param("id", id.clone())
    .param("name", &*data.name)
    .param("email", &*data.email)
    .param("password_hash", password_hash);

    let result = graph.execute(query).await;

    if let Ok(mut result) = result {
        while let Ok(Some(row)) = result.next().await {
            let node: Node = row.get("u").unwrap();
            return Ok(User {
                id: node.get("id").unwrap(),
                name: node.get("name").unwrap(),
                email: node.get("email").unwrap(),
                password_hash: node.get("password_hash").unwrap(),
            });
        }
    }

    println!("Failed to register user");
    Err(neo4rs::Error::AuthenticationError("Failed to register user".to_owned()))
}



async fn create_neo4j_client() -> Result<Graph, neo4rs::Error> {
    let config = ConfigBuilder::default()
        .uri(NEO4J_URI)
        .user(NEO4J_USER)
        .password(NEO4J_PASS)
        .db("neo4j")
        .fetch_size(500)
        .max_connections(10)
        .build()?;

    Graph::connect(config).await
}


fn verify_password(password: &String, hashed_password: &String) -> bool {
    let parsed_hash = PasswordHash::new(hashed_password).expect("Invalid password hash format");
    Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok()
}

async fn username_exists(graph: &Graph, username: &str) -> bool {
    let query = query("MATCH (u:User {name: $username}) RETURN u").param("username", username);
    let mut result = graph.execute(query).await.unwrap();
    
    result.next().await.unwrap().is_some()
}

async fn email_exists(graph: &Graph, email: &str) -> bool {
    let query = query("MATCH (u:User {email: $email}) RETURN u").param("email", email);
    let mut result = graph.execute(query).await.unwrap();
   
    result.next().await.unwrap().is_some()
}

pub async fn logout(session: Session) -> HttpResponse {
    // Remove user_id from the session upon logout
    session.remove("user_id");
    HttpResponse::Ok().json(json!({ "message": "Logout successful" }))
}