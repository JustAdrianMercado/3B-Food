"use client";
import { RotateCcw } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="contenido"><div className="container not-found"><span className="eyebrow">ALGO NO SE CARGÓ COMO ESPERÁBAMOS</span><h1>Intentémoslo una vez más.</h1><p>Puede ser un problema momentáneo de conexión.</p><button className="btn btn-primary" onClick={reset}><RotateCcw size={17} />Volver a intentar</button></div></main>; }
