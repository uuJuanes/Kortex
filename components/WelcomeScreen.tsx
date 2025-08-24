import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const features = [
    {
      icon: <ChartBarIcon className="w-8 h-8 text-primary" />,
      title: "Métricas Vivas",
      description: "Visualiza el progreso, carga de trabajo y riesgos en tiempo real para tomar decisiones informadas.",
    },
    {
      icon: <UsersGroupIcon className="w-8 h-8 text-secondary" />,
      title: "Equipo Alineado",
      description: "Administra miembros, tareas y comunicación desde un solo lugar, manteniendo a todos en sintonía.",
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-accent" />,
      title: "IA Copiloto",
      description: "Crea tableros automáticos, recibe insights estratégicos y anticipa problemas antes de que ocurran.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background-default text-text-default overflow-x-hidden">
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] via-[#00C9FF] to-[#6C63FF] animate-gradient-pan"></div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        
        @keyframes gradient-pan {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-pan {
            background-size: 200% 200%;
            animation: gradient-pan 15s ease infinite;
        }
      `}</style>
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-default">
            Organiza proyectos. Impulsa tu equipo.
          </h1>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mt-2">
            Llega más lejos con IA.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-text-muted">
            Tu espacio de trabajo inteligente con tableros, métricas en tiempo real y copiloto de IA integrado.
          </p>
          <div className="mt-10 flex justify-center">
            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                Crear mi primer tablero <span className="ml-2 text-2xl">🚀</span>
              </span>
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-20 max-w-5xl mx-auto w-full animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background-card/60 dark:bg-background-card/40 backdrop-blur-lg p-6 rounded-xl border border-border-default shadow-lg transform transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-background-subtle mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-text-default mb-2">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20 max-w-4xl mx-auto w-full animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <div className="bg-background-subtle/50 backdrop-blur-lg p-8 rounded-xl border border-border-default">
            <h2 className="text-2xl md:text-3xl font-bold text-text-default">
              Empieza gratis y lleva la organización de tu equipo a otro nivel.
            </h2>
            <div className="mt-6 flex justify-center">
               <button
                  onClick={onStart}
                  className="px-6 py-2.5 text-base font-semibold text-text-default bg-background-card rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:bg-background-subtle border border-border-default"
                >
                  <span className="relative z-10">Comenzar ahora</span>
                </button>
            </div>
          </div>
        </section>
        
        <footer className="mt-16 text-text-muted text-sm animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <p>Kortex &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};

export default WelcomeScreen;
