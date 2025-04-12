'use client';

import Image from "next/image";
import React, { useState, useEffect } from 'react';



interface FormData {
    name: string;
    email: string;
    productType: string;
    weight: string;
    message: string;
    estimatedPrice: number | null;
    estimatedTime: number | null;
}

const Step = ({ number, title, description }: { number: number, title: string, description: string }) => (
    <div className="flex items-start mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-cyan-600 text-white rounded-full font-bold mr-4 flex-shrink-0 shadow-md">
            {number}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    </div>
);


export default function Home() {
    // State for the form inputs with TypeScript types
    const [productType, setProductType] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    // State for the calculated estimates
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

    // State for submission status
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);


    const handleScrollToEstimator = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const estimatorSection = document.getElementById('estimator');
        if (!estimatorSection) return;
        estimatorSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        const formData: FormData = {
            name,
            email,
            productType,
            weight,
            message,
            estimatedPrice,
            estimatedTime
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok (status: ${response.status})`);
            }

            setSubmitStatus('success');
            setName(''); setEmail(''); setProductType(''); setWeight(''); setMessage('');
        } catch (error) {
            console.error("Form submission error:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };


    // Basic estimation logic
    useEffect(() => {
        if (!productType || !weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
            setEstimatedPrice(null);
            setEstimatedTime(null);
            return;
        }

        const w = parseFloat(weight);

        // --- Baseline Parameters ---
        const basePrice = 150; // RON - Minimum charge, regardless of weight
        const baseTime = 10;   // Hours - Minimum time for any batch
        const avgPricePerKgFullBatch = 10; // RON/kg - Average derived from batch price
        const avgTimePerKgFullBatch = 0.32; // Hours/kg - Average derived from batch time
        // --- End Baseline Parameters ---

        // --- Adjust Rates Based on Product Type ---
        let priceMultiplier = 1.0;
        let timeMultiplier = 1.0;

        // Use table for relative adjustments (Times ~18h seem standard in table)
        switch (productType) {
            case 'Fructe/Legume':
                // Check specific examples from table if needed, otherwise use default.
                // High water content fruits/veg might take longer.
                // Example: Watermelon/Papaya/Tomato (~20h+ in table) might be 1.1x-1.2x
                // We'll keep the category broad for now, using default multiplier
                priceMultiplier = 1.0; timeMultiplier = 1.0;
                break;
            case 'Carne/Lactate': // Meats are in table (~17h), similar to standard
                priceMultiplier = 1.0; timeMultiplier = 1.0;
                break;
            case 'Preparate Culinare': // Meals/Noodles are faster in table (~14h)
                priceMultiplier = 0.9; timeMultiplier = 0.8;
                break;
            case 'Farmaceutice/Biologice': // Assume higher value, care, possibly longer/slower drying
                priceMultiplier = 1.8; timeMultiplier = 1.2; // Example: 80% higher price, 20% longer time
                break;
            case 'Plante/Flori': // Herbal/Rose ~18h, potentially delicate
               priceMultiplier = 1.1; timeMultiplier = 1.0; break;
            default: // 'Altele' or unlisted uses average rates
                priceMultiplier = 1.0; timeMultiplier = 1.0;
                break;
        }
        // --- End Adjustments ---

        // Calculate effective per-kg rates for this product type
        const effectivePricePerKg = avgPricePerKgFullBatch * priceMultiplier;
        const effectiveTimePerKg = avgTimePerKgFullBatch * timeMultiplier;

        // Calculate final estimate using the adjusted linear model
        const calculatedPrice = basePrice + w * effectivePricePerKg;
        const calculatedTime = baseTime + w * effectiveTimePerKg;

        setEstimatedPrice(calculatedPrice);
        setEstimatedTime(calculatedTime);
    }, [
        productType,
        weight,
    ]);


    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200 font-sans">
            {/* Optional Header/Navbar */}
            <header className="bg-gray-800 shadow-lg p-6 select-none sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-center gap-x-3 md:gap-x-4">
                    <Image
                        src="/logo-frighet.png"
                        alt="frighet.ro Logo"
                        width={48}
                        height={48}
                        className="flex-shrink-0"
                        priority={true}
                        draggable={false}
                    />

                    <h1 className="text-3xl md:text-4xl uppercase font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                        frigheț.ro
                    </h1>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white px-4 text-center shadow-xl flex flex-col items-center justify-center min-h-[80vh]">
                    <div className="container mx-auto py-10">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 drop-shadow-lg leading-24">
                            Servicii Profesionale
                            <br />
                            Liofilizare în România
                        </h1>
                        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto drop-shadow-sm leading-10">
                            conservați calitatea prin liofilizare—înghețare uscată:
                            <br />
                            păstrarea intactă a nutrienților, aromei și structurii produselor
                        </p>
                        <a
                            href="#estimator"
                            onClick={handleScrollToEstimator}
                            className="bg-white text-blue-700 font-bold py-3 px-10 rounded-full shadow-lg hover:bg-gray-200 transform hover:scale-105 transition duration-300 ease-in-out"
                        >
                            Obține Estimare & Contact
                        </a>
                        {/* Optional Image placeholder could go here */}
                    </div>
                </section>

                {/* What is Lyophilization Section */}
                <section className="py-16 md:py-20 px-4 bg-gray-900">
                    <div className="container mx-auto max-w-4xl text-center">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-cyan-400">Ce este Liofilizarea?</h2>
                        <p className="text-lg text-gray-300 mb-4">
                            Liofilizarea, cunoscută și ca înghețare uscată, este un proces avansat de deshidratare la temperaturi joase și sub vid. Apa din produs este înghețată, apoi eliminată direct sub formă de vapori (sublimare).
                        </p>
                        <p className="text-lg text-gray-300 font-medium">
                            Rezultatul? Produse cu termen de valabilitate extins, greutate redusă, care își păstrează excelent proprietățile originale (nutrienți, aromă, culoare, formă) după rehidratare.
                        </p>
                    </div>
                </section>

                <section className="py-16 md:py-20 px-4 bg-gray-800">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-cyan-400">Cum Funcționează Serviciul Nostru</h2>
                        <div className="space-y-8">
                            <Step
                                number={1}
                                title="Contact & Planificare"
                                description="Ne contactați prin formular sau email. Discutăm nevoile dvs., tipul produsului, cantități estimate și cerințe specifice (ex: ambalare)."
                            />
                            <Step
                                number={2}
                                title="Expediere Produse Către Noi"
                                description="Ne trimiteți produsele pregătite (proaspete sau congelate, conform discuției) la sediul nostru, utilizând metoda de curierat preferată."
                            />
                            <Step
                                number={3}
                                title="Procesare Liofilizare"
                                description="Realizăm procesul de liofilizare în echipamentele noastre specializate, monitorizând atent parametrii pentru a asigura calitatea optimă."
                            />
                            <Step
                                number={4}
                                title="Ambalare Opțională"
                                description="Dacă ați solicitat, ambalăm produsele liofilizate conform specificațiilor (ex: pungi Mylar sigilate, recipiente etanșe)."
                            />
                            <Step
                                number={5}
                                title="Returnare Produse Către Dvs."
                                description="Expediem produsele finite înapoi la adresa dvs., gata pentru depozitare pe termen lung sau utilizare imediată."
                            />
                        </div>
                    </div>
                </section>

                {/* Estimator & Contact Form Section */}
                <section id="estimator" className="py-16 md:py-20 px-4 bg-gray-900">
                    <div className="container mx-auto max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-10 text-center text-cyan-400">
                            Obțineți o Estimare & Luați Legătura
                        </h2>

                        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-700">
                            {/* Estimator Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="productType" className="block text-sm font-medium text-gray-300 mb-1">Tip Produs *</label>
                                    <select
                                        id="productType"
                                        value={productType}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProductType(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
                                    >
                                        <option value="" disabled>Selectați tipul...</option>
                                        <option value="Fructe/Legume">Fructe / Legume</option>
                                        <option value="Carne/Lactate">Carne / Lactate</option>
                                        <option value="Preparate Culinare">Preparate Culinare</option>
                                        <option value="Farmaceutice/Biologice">Farmaceutice / Biologice</option>
                                        <option value="Plante/Flori">Plante / Flori</option>
                                        <option value="Altele">Altele</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">Greutate Estimată (kg) *</label>
                                    <input
                                        type="number"
                                        id="weight"
                                        value={weight}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
                                        required
                                        min="0.1"
                                        step="0.1"
                                        placeholder="ex: 5.5"
                                        className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
                                    />
                                </div>
                            </div>

                            {(estimatedPrice !== null || estimatedTime !== null) && (
                                <div className="bg-gray-700 p-4 rounded-md border border-gray-600 text-center space-y-2">
                                    <p className="text-sm text-gray-400">Estimări preliminare:</p>
                                    <div>
                                        {estimatedPrice !== null && <span className="text-lg font-semibold text-cyan-400">Preț: ~{estimatedPrice.toFixed(2)} RON</span>}
                                        {estimatedPrice !== null && estimatedTime !== null && <span className="mx-2 text-gray-500">|</span>}
                                        {estimatedTime !== null && <span className="text-lg font-semibold text-cyan-400">Timp: ~{estimatedTime.toFixed(0)} ore</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 italic px-4">
                                        Aceste valori sunt estimări rapide și pot varia. Depind de produs, umiditate, etc.
                                        <br />
                                        Vă vom contacta pentru detalii și o ofertă exactă.
                                    </p>
                                </div>
                            )}

                            {/* Contact Inputs */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nume *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                                    Detalii Produs / Nevoi Specifice (Opțional)
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={message}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                                    placeholder="Descrieți pe scurt produsul, cantitatea aproximativă necesară, cerințe speciale de ambalare, etc."
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 min-h-[120px]"
                                ></textarea>
                            </div>

                            {/* Privacy Consent Placeholder */}
                            {/* <div className="flex items-center">
                                <input id="privacy" name="privacy" type="checkbox" required className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700" />
                                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-300">
                                    Sunt de acord cu <a href="/politica-confidentialitate" target="_blank" className="underline hover:text-cyan-400">Politica de Confidențialitate</a>.
                                </label>
                            </div> */}

                            {/* Submit Button & Status */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500'} transition duration-300 ease-in-out`}
                                >
                                    {isSubmitting ? 'Se trimite...' : 'Trimite Solicitarea'}
                                </button>
                            </div>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <p className="text-center text-green-300 bg-green-900/50 p-3 rounded-md border border-green-700">
                                    Mulțumim! Solicitarea dvs. a fost trimisă cu succes.
                                    <br /> Vă vom contacta în curând.
                                </p>
                            )}
                            {submitStatus === 'error' && (
                                <p className="text-center text-red-300 bg-red-900/50 p-3 rounded-md border border-red-700">
                                    Oops! A apărut o eroare la trimitere.
                                    <br />
                                    Vă rugăm încercați din nou sau contactați-ne direct.
                                </p>
                            )}
                        </form>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black text-gray-400 py-6 px-4 text-center mt-auto">
                <div className="container mx-auto">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} frighet.ro. Toate drepturile rezervate.
                    </p>
                    {/* <p className="text-sm mt-1">
                        <a href="/politica-confidentialitate" target="_blank" className="underline hover:text-gray-200">Politica de Confidențialitate</a>
                    </p> */}
                </div>
            </footer>
        </div>
    );
}
