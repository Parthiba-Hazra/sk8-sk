use actix_web::{web, HttpResponse, Responder};
use crate::auth::login_register; 
use serde_json::json;

async fn submit_task() -> impl Responder {
    let response = json!({
        "message": "Task submitted successfully!",
    });
    println!("Got a task to do!");
    HttpResponse::Ok().json(response)
}

async fn monitor_task() -> impl Responder {
    HttpResponse::Ok().body("Monitoring task status...")
}

pub fn config(cfg: &mut web::ServiceConfig) {
    // Add routes for login and register
    cfg.service(
        web::resource("/login")
            .route(web::post().to(login_register::login)),
    );
    cfg.service(
        web::resource("/register")
            .route(web::post().to(login_register::register)),
    );

    // Add your existing task routes
    cfg.service(
        web::resource("/task/submit")
            .route(web::post().to(submit_task)),
    );
    cfg.service(
        web::resource("/task/monitor")
            .route(web::get().to(monitor_task)),
    );
}