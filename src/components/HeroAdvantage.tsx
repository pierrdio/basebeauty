import { ReactNode } from "react";

type HeroAdvantageProps = {
    title: string;
    description: string;
    icon: ReactNode;
};

export default function HeroAdvantage({
    title,
    description,
    icon,
}: HeroAdvantageProps) {
    return (
        <li className="flex w-full items-start justify-between rounded-xl bg-[#222222] px-6 py-5 text-white font-onest font-onest-medium h-full">
            <div className="flex flex-col flex-1 pr-4">
                <h3 className="text-2xl font-bold leading-snug">{title}</h3>
                <p className="text-md leading-snug text-[#E4E4E4] mt-auto">{description}</p>
            </div>
            <div className="shrink-0 mt-1 flex items-center justify-center text-white w-16 h-16 overflow-hidden p-2">
                {icon}
            </div>
        </li>
    );
}
