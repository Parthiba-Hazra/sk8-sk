use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use actix_session::SessionMiddleware;
use actix_web::cookie::Key;
use actix_session::storage::CookieSessionStore;

mod routes;
mod auth;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let secret_key = Key::generate();
    // Add Cors middleware
    HttpServer::new(move || {
        let logger = actix_web::middleware::Logger::default();
        App::new()
            .wrap(
             SessionMiddleware::builder(CookieSessionStore::default(), secret_key.clone())
                    .cookie_secure(false)
                    .build(),
            )
            .wrap(logger)
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allowed_methods(vec!["GET", "POST"])
                    .allowed_headers(vec!["Content-Type"])
                    .supports_credentials()
                    .max_age(3600),
            )
            .service(web::scope("/api").configure(routes::config))
    })
    .bind("localhost:8080")?
    .run()
    .await
}
