"use client";
import { useState, useEffect } from "react";
import { useI18n } from "../i18n"; 

export default function Home() {
    const { t } = useI18n(); 
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

        if (!title.trim() || !desc.trim()) {
            alert(t.ticketera.errors.ERR_FIELDS_REQUIRED); 
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
            const data = await res.json(); 
            if (data.error && t.ticketera.errors[data.error as keyof typeof t.ticketera.errors]) {
                alert(t.ticketera.errors[data.error as keyof typeof t.ticketera.errors]); // <--- Traduce el error del backend
            } else {
                alert("Error");
            }
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
            <h1 className="text-3xl font-bold mb-8 text-blue-400">{t.ticketera.title}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl sticky top-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">{t.ticketera.createTicket}</h2>
                        
                        <input className="w-full bg-slate-700 border-none p-3 mb-4 rounded text-white" 
                               placeholder={t.ticketera.titleField} value={title} onChange={(e) => setTitle(e.target.value)} />
                        
                        <textarea className="w-full bg-slate-700 border-none p-3 mb-4 rounded text-white h-24" 
                                  placeholder={t.ticketera.descField} value={desc} onChange={(e) => setDesc(e.target.value)} />

                        <select className="w-full bg-slate-700 border-none p-3 mb-6 rounded text-white" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="Baja">{t.ticketera.priorityLow}</option>
                            <option value="Media">{t.ticketera.priorityMedium}</option>
                            <option value="Alta">{t.ticketera.priorityHigh}</option>
                        </select>

                        <button type="submit" className="w-full p-3 rounded font-bold bg-blue-600 hover:bg-blue-500">
                            {t.ticketera.btnCreate}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {tickets.map((tItem: any) => ( // 'tItem' para no confundir con 't' de traducciones
                        <div key={tItem.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700 flex justify-between items-center">
                            <div className="flex-1">
                                <h2 className="font-bold text-lg">{tItem.title}</h2>
                                <p className="text-slate-400 text-sm mb-2">{tItem.description}</p>
                                
                                <span className={`text-xs px-2 py-1 rounded font-bold ${tItem.status === 'Resuelto' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                    {tItem.status === 'Resuelto' ? t.ticketera.statusResolved : t.ticketera.statusOpen}
                                </span>
                            </div>
                            <div className="flex gap-2 ml-4">
                                {tItem.status !== 'Resuelto' && (
                                    <button onClick={() => resolverTicket(tItem.id)} className="text-xs bg-green-600 px-3 py-2 rounded">{t.ticketera.btnResolve}</button>
                                )}
                                <button onClick={() => eliminarTicket(tItem.id)} className="text-xs bg-red-600 px-3 py-2 rounded">{t.ticketera.btnDelete}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}












