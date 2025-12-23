import Link from "next/link";
import { Button } from "./ui/button";

export default function Footer() {

    const getYear = () => {
        const date = new Date();
        return date.getFullYear();
    }

    return (
        <footer className="bg-[#000000] w-full px-8 py-12 font-onest">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
                <div className="flex flex-col gap-2">
                    <Link className="text-white text-xl lg:text-2xl font-medium" href="tel:+74957107298">+7 (495) 710-72-98</Link>
                    <span className="text-white font-light text-base lg:text-lg">10:00-19:00/ Пн-пт</span>
                </div>
                <div className="text-center lg:text-left">
                    <span className="text-white text-xl lg:text-2xl font-medium">Адрес: Село Рыболово, 240Б</span>
                </div>
                <div className="flex flex-col gap-2 text-center lg:text-right">
                    <Link className="text-white text-xl lg:text-2xl" href="mailto:mail@basebeauty.ru">mail@basebeauty.ru</Link>
                </div>
            </div>
            <div className="h-px bg-linear-to-r from-white via-gray-800 to-white my-6 opacity-30"></div>
            <div className="flex justify-center gap-4 lg:gap-6 mb-8">
                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                    <div className="bg-black rounded-lg">
                        <Link
                            href="/#portfolio"
                            className="flex items-center justify-center bg-[#222222] text-white text-base max-sm:text-xs font-normal border-0 rounded-lg py-2 lg:py-4 px-3 lg:px-5 cursor-pointer hover:bg-[#333333] transition-colors whitespace-nowrap h-12 lg:h-14"
                        >
                            Портфолио
                        </Link>
                    </div>
                </div>
                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                    <div className="bg-black rounded-lg">
                        <Link
                            href="/#services"
                            className="flex items-center justify-center bg-[#222222] text-white text-base max-sm:text-xs font-normal border-0 rounded-lg py-2 lg:py-4 px-3 lg:px-5 cursor-pointer hover:bg-[#333333] transition-colors whitespace-nowrap h-12 lg:h-14"
                        >
                            Услуги
                        </Link>
                    </div>
                </div>
                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                    <div className="bg-black rounded-lg">
                        <Link
                            href="/#contact"
                            className="flex items-center justify-center bg-[#222222] text-white text-base max-sm:text-xs font-normal border-0 rounded-lg py-2 lg:py-4 px-3 lg:px-5 cursor-pointer hover:bg-[#333333] transition-colors whitespace-nowrap h-12 lg:h-14"
                        >
                            Связаться с нами
                        </Link>
                    </div>
                </div>
            </div>

            <div className="h-px bg-linear-to-r from-white via-gray-800 to-white my-6 opacity-30"></div>

            <div className="flex flex-col lg:flex-row justify-center items-center text-lg text-gray-400 gap-4 lg:gap-10">
                <span>© 1993-{getYear()} Все права защищены</span>
                <Link className="hover:text-white cursor-pointer transition-colors" href="/privacy-policy">Политика конфиденциальности</Link>
            </div>
        </footer>
    )
}