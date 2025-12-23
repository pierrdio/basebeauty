import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#222222] flex flex-col">
            <main className="grow flex items-center justify-center px-4 pt-30">
                <div className="text-center max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-9xl font-bold text-[#00D89F] mb-4">404</h1>
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#00D89F] to-transparent mx-auto mb-8"></div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                        Страница не найдена
                    </h2>

                    <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                        Кажется, такой страницы не существует. Возможно, она была удалена или вы ввели неверный адрес.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#00D89F] text-black font-medium rounded-lg hover:bg-[#00b87f] transition-colors"
                        >
                            На главную
                        </Link>

                        <Link
                            href="/works"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-white rounded-lg hover:border-gray-400 transition-colors"
                        >
                            Наши работы
                        </Link>
                    </div>

                    <div className="mt-12 text-gray-500 text-sm">
                        Или вернитесь назад с помощью кнопки браузера
                    </div>
                </div>
            </main>

        </div>
    );
}
