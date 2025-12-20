import { Clock, ClockArrowUp, Flame, Gem, Users } from "lucide-react";
import HeroAdvantage from "./HeroAdvantage";
import { Button } from "./ui/button";
import Link from "next/link";

export default function HeroRelease() {
    
    const advantages = [
        {
            title: "Опытная команда",
            description: "Справится с любой задачей",
            icon: <Users size={40} />,
        },
        {
            title: "Мощное производство",
            description: "Позволяет делать любой декор",
            icon: <Flame size={40} />,
        },
        {
            title: "25+ лет",
            description: "Уверенно работаем",
            icon: <Clock size={40} />,
        },
        {
            title: "Работа в сжатые сроки",
            description: "Успеем без потери качества",
            icon: <ClockArrowUp size={40} />,
        },
        {
            title: "Цена качество",
            description: "Используем лучшие материалы",
            icon: <Gem size={40} />,
        },
    ];

    return (
        <div className="p-px bg-linear-to-br from-gray-500 via-gray-900 to-stone-200 rounded-4xl w-full flex-1 max-sm:rounded-3xl">
            <div className="rounded-4xl max-sm:rounded-3xl bg-[#111111] pt-4 sm:pt-6 text-white w-full flex-1 flex flex-col min-h-[500px] sm:min-h-[600px] gap-4">
            <div className="px-6">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-[#00D89F] mb-4 sm:mb-6">
                    Реализуем все ваши идеи
                </h1>

                <div className="flex-grow flex flex-col gap-4 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <HeroAdvantage {...advantages[0]} />
                    <HeroAdvantage {...advantages[2]} />
                    <HeroAdvantage {...advantages[1]} />
                    <HeroAdvantage {...advantages[3]} />
                </div>

                <div className="flex justify-center">
                    <ul>
                        <li className="flex w-full items-start justify-between rounded-xl bg-[#222222] px-6 py-3 text-white">
                            <div className="space-y-1 pr-4">
                                <h3 className="text-2xl font-semibold leading-snug font-onest-bold">{advantages[4].title}</h3>
                                <p className="text-md leading-snug text-[#E4E4E4] font-onest-medium">{advantages[4].description}</p>
                            </div>
                            <div className="mt-1 flex items-start justify-end text-white">
                                {advantages[4].icon}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            </div>

            <Link href="#contact" className="w-full mt-auto rounded-4xl border-2 border-[#00D89F] py-2 sm:py-2 text-center text-md sm:text-5xl font-semibold text-white hover:bg-[#00D89F] hover:text-black transition-colors font-onest-semibold">
                Отправить бриф
            </Link>
            </div>
        </div>
    );
}
