"use client";
import { RotateCcw } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container not-found"><span className="eyebrow">ALGO NO SE CARGÓ COMO ESPERÁBAMOS</span><h1>Intentémoslo una vez más.</h1><p>Tus datos de demostración siguen guardados en este navegador.</p><button className="btn btn-primary" onClick={reset}><RotateCcw size={17} />Volver a intentar</button></div>; }
