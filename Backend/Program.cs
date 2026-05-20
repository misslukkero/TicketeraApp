var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
                origin.EndsWith(".vercel.app") || 
                origin == "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
var app = builder.Build();
app.UseCors("CorsPolicy");

// Uso una lista de objetos clase para poder modificar sus propiedades
var listaTickets = new List<Ticket>
{
    new Ticket { Id = 1, Title = "Falla SharePoint", Description = "Error permisos", Priority = "Alta", Status = "Abierto" }
};

app.MapGet("/api/tickets", () => Results.Ok(listaTickets));

app.MapPost("/api/tickets", (Ticket nuevoTicket) =>
{
    // Validación básica: comprobar si los campos obligatorios están vacíos
    if (string.IsNullOrWhiteSpace(nuevoTicket.Title) || string.IsNullOrWhiteSpace(nuevoTicket.Description))
    {
        return Results.BadRequest("El título y la descripción son obligatorios.");
    }

    nuevoTicket.Id = listaTickets.Count > 0 ? listaTickets.Max(t => t.Id) + 1 : 1;
    nuevoTicket.Status = "Abierto";
    listaTickets.Add(nuevoTicket);
    
    return Results.Created($"/api/tickets/{nuevoTicket.Id}", nuevoTicket);
});

app.MapPut("/api/tickets/{id}/resolver", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null) return Results.NotFound();
    
    // Ahora que Ticket es una clase:
    ticket.Status = "Resuelto"; 
    return Results.Ok(ticket);
});

app.MapDelete("/api/tickets/{id}", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null) return Results.NotFound();
    listaTickets.Remove(ticket);
    return Results.Ok();
});

app.Run();

// Definir Ticket como clase para permitir modificaciones (mutabilidad)
public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Media";
    public string Status { get; set; } = "Abierto";
}
