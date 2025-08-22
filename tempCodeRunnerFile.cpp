#include "crow_all.h"

int main()
{
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        return "Hello, World!";
    });

    CROW_ROUTE(app, "/add/<int>/<int>")([](int a, int b){
        return crow::response(std::to_string(a + b));
    });

    app.port(18080).multithreaded().run();
}
