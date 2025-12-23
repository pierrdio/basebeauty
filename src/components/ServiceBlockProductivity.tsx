import React from 'react';
import ServiceBlockItem from "./ServiceBlockItem";

export default function ServiceBlockProductivity({ title }: { title: string }) {

    const services: (string | React.ReactNode)[] = [<>Массовые<br />мероприятия</>, <>Телевизионные<br />студии</>, <>Оформление<br />концертов</>, <>Частные<br />мероприятия</>, <>Оформление<br />выставочных пространств</>, "МАФЫ"];

    return (
        <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-lg w-full">
            <div className="w-full relative bg-black p-6 sm:p-8 rounded-lg overflow-hidden bg-[url('/servicebg.png')] bg-repeat bg-size-[100%_auto]">
            <div className="relative z-10">
                <h3 className="w-fit rounded-xl bg-[#1DCD9F] px-6 py-3 text-white mb-6 sm:mb-8 font-semibold text-2xl sm:text-4xl font-onest-semibold">
                    {title}
                </h3>

                <div className="flex flex-wrap gap-3 sm:gap-4 text-xl sm:text-2xl items-center font-onest-medium">
                    {services.map((service, index) => (
                        <ServiceBlockItem key={index} title={service} />
                    ))}
                </div>
            </div>
            </div>
        </div>
    );
}