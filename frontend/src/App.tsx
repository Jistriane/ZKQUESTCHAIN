import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';

export const App = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <HomePage />
      </main>
    </div>
  );
};
