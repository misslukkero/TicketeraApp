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
        <main className="min-h-screen bg-slate-900 p-8 text-white">
            <h1 className="text-3xl font-bold mb-8 text-blue-400">Ticketera IT - Gestion de Incidentes</h1>

            {/* Layout principal: Grid de 3 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Panel Izquierdo: Formulario */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl sticky top-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">Crear Ticket</h2>
                        <input className="w-full bg-slate-700 border-none p-3 mb-4 rounded text-white" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <textarea className="w-full bg-slate-700 border-none p-3 mb-4 rounded text-white h-24" placeholder="Descripción" value={desc} onChange={(e) => setDesc(e.target.value)} />

                        <select className="w-full bg-slate-700 border-none p-3 mb-6 rounded text-white" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="Baja">Prioridad: Baja</option>
                            <option value="Media">Prioridad: Media</option>
                            <option value="Alta">Prioridad: Alta</option>
                        </select>

                        <button 
                            type="submit" 
                            disabled={!title.trim() || !desc.trim()}
                            className={`w-full p-3 rounded font-bold transition ${!title.trim() || !desc.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                            Crear Ticket
                        </button>
                    </form>
                </div>

                {/* Panel Derecho: Lista de Tickets */}
                <div className="lg:col-span-2 space-y-4">
                    {tickets.map((t: any) => (
                        <div key={t.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700 flex justify-between items-center hover:border-blue-500/50 transition">
                            <div className="flex-1">
                                <h2 className="font-bold text-lg">{t.title}</h2>
                                <p className="text-slate-400 text-sm mb-2">{t.description}</p>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Prioridad: {t.priority}</span>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${t.status === 'Resuelto' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                                {t.status !== 'Resuelto' && (
                                    <button onClick={() => resolverTicket(t.id)} className="text-xs bg-green-600 hover:bg-green-700 px-3 py-2 rounded font-bold">
                                        Resolver
                                    </button>
                                )}
                                <button onClick={() => eliminarTicket(t.id)} className="text-xs bg-red-600 hover:bg-red-700 px-3 py-2 rounded font-bold">
                                    Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
