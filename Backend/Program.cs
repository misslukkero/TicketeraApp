var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURACIÓN DE CORS: Permitiendo que Next.js (puerto 3000) consulte esta API
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirNextjs", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Activa el CORS antes de los endpoints
app.UseCors("PermitirNextjs");

// 2. BASE DE DATOS EN MEMORIA (Nativa)
var listaTickets = new List<Ticket>
{
    new Ticket { Id = 1, Title = "Falla de acceso a SharePoint", Description = "Usuario informa error de permisos unívocos en la biblioteca.", Priority = "Alta", Status = "Abierto" },
    new Ticket { Id = 2, Title = "Error de sincronización con Azure", Description = "Sincronización de Entra ID retrasada 4 horas.", Priority = "Media", Status = "Resuelto" }
};

// 3. ENDPOINTS DE LA API

// GET: Obtener todos los tickets
app.MapGet("/api/tickets", () => Results.Ok(listaTickets));

// POST: Crear un nuevo ticket
app.MapPost("/api/tickets", (Ticket nuevoTicket) =>
{
    // Auto-incrementar el ID de forma manual y simple
    nuevoTicket.Id = listaTickets.Count > 0 ? listaTickets.Max(t => t.Id) + 1 : 1;
    nuevoTicket.Status = "Abierto"; // Todo ticket nuevo arranca abierto

    listaTickets.Add(nuevoTicket);
    return Results.Created($"/api/tickets/{nuevoTicket.Id}", nuevoTicket);
});

// PUT: Cambiar el estado de un ticket a Resuelto
app.MapPut("/api/tickets/{id}/resolver", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null)
    {
        return Results.NotFound(new { Mensaje = "El ticket no existe" });
    }

    ticket.Status = "Resuelto";
    return Results.Ok(ticket);
});
// DELETE: Eliminar un ticket por su ID
app.MapDelete("/api/tickets/{id}", (int id) =>
{
    var ticket = listaTickets.FirstOrDefault(t => t.Id == id);
    if (ticket is null) return Results.NotFound(new { Mensaje = "El ticket no existe" });

    listaTickets.Remove(ticket);
    return Results.Ok(new { Mensaje = "Eliminado" });
});
app.Run();

// 4. MODELO DEL TICKET (Estructura de los datos)
public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Media"; // Alta, Media, Baja
    public string Status { get; set; } = "Abierto";   // Abierto, Resuelto
}