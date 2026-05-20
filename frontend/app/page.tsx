"use client";
import { useState, useEffect } from "react";

export default function Home() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState("Media");

    const fetchTickets = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`);
        const data = await res.json();
        setTickets(data);
    };

    useEffect(() => {
        fetchTickets();
    }, []);
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación extra en el cliente (para no hacer la llamada si ya está vacío)
    if (!title.trim() || !desc.trim()) {
        alert("Por favor, rellena el título y la descripción.");
        return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, priority }),
    });

    if (res.ok) {
        setTitle(""); 
        setDesc(""); 
        setPriority("Media");
        fetchTickets();
    } else {
        // Aquí capturo el error que viene del backend en C#
        const errorMessage = await res.text();
        alert(errorMessage || "Error al crear el ticket");
    }
};

    const resolverTicket = async (id: number) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}/resolver`, {
            method: 'PUT'
        });
        fetchTickets();
    };

    const eliminarTicket = async (id: number) => {
        // 1. Lanzo el cuadro de diálogo
        const confirmado = window.confirm("¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.");

        // 2. Si el usuario cancela, no hace nada
        if (!confirmado) return;

        // 3. Si aceptó, procedo con el borrado
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchTickets();
            } else {
                console.error("Error al borrar el ticket");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };
    return (
        <main className="p-10">
            <h1 className="text-2xl font-bold mb-5">Ticketera IT - Gestion de incidencias</h1>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mb-10 p-4 border rounded">
                <input className="border p-2 mr-2" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className="border p-2 mr-2" placeholder="Descripción" value={desc} onChange={(e) => setDesc(e.target.value)} />

                <select className="border p-2 mr-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                </select>

                <button 
                    type="submit" 
                    disabled={!title.trim() || !desc.trim()}
                    className={`p-2 rounded text-white ${!title.trim() || !desc.trim() ? 'bg-gray-400' : 'bg-blue-500'}`}            
                >
                    Crear Ticket
                </button>
            </form>

            {/* Lista */}
            <div className="grid gap-4">
                {tickets.map((t: any) => (
                    <div key={t.id} className="border p-4 rounded shadow-sm flex justify-between items-center">
                        <div>
                            <h2 className="font-bold">{t.title}</h2>
                            <p>{t.description}</p>
                            <p className="text-sm text-gray-500 mt-1">Prioridad: {t.priority}</p>
                            <span className={`text-sm px-2 py-1 rounded font-semibold ${t.status === 'Resuelto'
                                    ? 'bg-green-600 text-white' // Fondo verde oscuro, texto blanco
                                    : 'bg-blue-100 text-blue-800' // Fondo azul claro, texto azul oscuro
                                }`}>
                                Estado: {t.status}
                            </span>
                        </div>

                        {t.status !== 'Resuelto' && (
                            <button
                                onClick={() => resolverTicket(t.id)}
                                className="bg-green-500 text-white p-2 rounded ml-4"
                            >
                                Resolver
                            </button>
                        )}
                        <button
                            onClick={() => eliminarTicket(t.id)}
                            className="bg-red-500 text-white p-2 rounded ml-2 hover:bg-red-600"
                        >
                            Borrar
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );  
}
