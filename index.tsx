
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const ApiKeyWrapper: React.FC = () => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-default p-4 font-sans text-text-default">
                <div className="text-center bg-background-card p-8 rounded-xl shadow-lg border border-danger">
                    <h1 className="text-2xl font-bold text-danger-text">Error de Configuración</h1>
                    <p className="text-text-muted mt-2 max-w-md">
                        La aplicación no puede iniciarse porque la clave de API de Gemini no está configurada correctamente.
                    </p>
                    <div className="mt-4 text-left bg-background-subtle p-4 rounded-md text-sm">
                        <p className="font-semibold">Solución:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Ve a la configuración de tu proyecto en Vercel.</li>
                            <li>Busca la sección <strong>Environment Variables</strong>.</li>
                            <li>Asegúrate de que existe una variable llamada <code className="bg-background-card px-1.5 py-0.5 rounded font-mono text-accent-text">API_KEY</code>.</li>
                            <li>El valor debe ser tu clave de API de Google Gemini.</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }
    return <App />;
};

root.render(
  <React.StrictMode>
    <ApiKeyWrapper />
  </React.StrictMode>
);