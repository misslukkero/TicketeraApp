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
    // objeto JSON con el código de error
    if (string.IsNullOrWhiteSpace(nuevoTicket.Title) || string.IsNullOrWhiteSpace(nuevoTicket.Description))
    {
        return Results.BadRequest(new { error = "ERR_FIELDS_REQUIRED" });
    }

    nuevoTicket.Id = listaTickets.Count > 0 ? listaTickets.Max(t => t.Id) + 1 : 1;
    nuevoTicket.Status = "Abierto"; 
    listaTickets.Add(nuevoTicket);
    
    return Results.Created($"/api/tickets/{nuevoTicket.Id}", nuevoTicket);
});

app.MapPut("/api/tickets/{id}/resolver", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null) return Results.NotFound(new { error = "ERR_TICKET_NOT_FOUND" });
    
    ticket.Status = "Resuelto"; 
    return Results.Ok(ticket);
});

app.MapDelete("/api/tickets/{id}", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null) return Results.NotFound(new { error = "ERR_TICKET_NOT_FOUND" });
    listaTickets.Remove(ticket);
    return Results.Ok(new { message = "MSG_TICKET_DELETED" });
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
