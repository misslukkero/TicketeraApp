var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURACIÓN ÚNICA DE CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://ticketera-app-vercel.app") 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 2. ACTIVAR CORS 
app.UseCors("CorsPolicy");

// 3. BASE DE DATOS EN MEMORIA
var listaTickets = new List<Ticket>
{
    new Ticket { Id = 1, Title = "Falla de acceso a SharePoint", Description = "Usuario informa error.", Priority = "Alta", Status = "Abierto" }
};

// 4. ENDPOINTS
app.MapGet("/api/tickets", () => Results.Ok(listaTickets));

app.MapPost("/api/tickets", (Ticket nuevoTicket) =>
{
    nuevoTicket.Id = listaTickets.Count > 0 ? listaTickets.Max(t => t.Id) + 1 : 1;
    nuevoTicket.Status = "Abierto";
    listaTickets.Add(nuevoTicket);
    return Results.Created($"/api/tickets/{nuevoTicket.Id}", nuevoTicket);
});

app.MapPut("/api/tickets/{id}/resolver", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    return ticket is null ? Results.NotFound() : Results.Ok(ticket with { Status = "Resuelto" });
});

app.MapDelete("/api/tickets/{id}", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null) return Results.NotFound();
    listaTickets.Remove(ticket);
    return Results.Ok();
});

app.Run();

public record Ticket(int Id, string Title, string Description, string Priority, string Status);
