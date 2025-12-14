import ServiceBlockItem from "./ServiceBlockItem";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

export default function ServiceBlockDesign({ title }: { title: string }) {

    const services: (string | React.ReactNode)[] = ["Декораций", <>Выстовочных<br />стендов</>, <>Телевизионные<br />студии</>, "Полиграфии", "МАФОВ", <>Оформление<br />мероприятий</>];

    const isProduction = title === "ПРОИЗВОДСТВО";

    return (
        <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-lg w-full">
            <div className="w-full relative bg-black p-6 sm:p-8 rounded-lg overflow-hidden bg-[url('/servicebg.png')] bg-repeat bg-cover flex flex-col sm:flex-row justify-between">
            <div className="relative z-10 flex-1 mb-6 sm:mb-0">
                <h3 className="w-fit rounded-xl bg-[#1DCD9F] px-6 py-3 text-white mb-6 sm:mb-8 font-semibold text-2xl sm:text-4xl">
                    {title}
                </h3>

                <div className="flex flex-wrap gap-3 sm:gap-4 text-xl sm:text-2xl items-center">
                    {services.map((service, index) => (
                        <ServiceBlockItem key={index} title={service} />
                    ))}
                </div>
            </div>
            {/* {!isProduction && (
                <div className="flex flex-col items-center max-w-37.5 justify-between sm:ml-6">
                    <Image
                        src="/ogni_desing.png"
                        alt="Огни дизайн"
                        width={100}
                        height={100}
                    />

                    <Link href="#" className="rounded-xl text-start border-2 border-[#1DCD9F] px-3 text-white hover:bg-[#1DCD9F] hover:text-white transition-colors cursor-pointer mt-4 sm:mt-0">
                        Посмотреть<br />работы
                    </Link>
                </div>
            )} */}
            </div>
        </div>
    );
}