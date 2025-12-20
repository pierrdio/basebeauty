'use client';

import { useState, useEffect } from 'react';

export default function WorkMap() {
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1349);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isClient) {
        return <div className="w-full h-screen bg-black"></div>;
    }

    // Mobile layout - все сверху вниз
    if (isMobile) {
        return (
            <div className="relative left-1/2 -translate-x-1/2 w-screen py-8 bg-black overflow-hidden">
                {/* Title */}
                <div className="absolute top-2 left-4 z-20">
                    <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-xl">
                        <div className="bg-[#222] bg-opacity-70 rounded-xl px-3 py-1">
                            <h2 className="text-lg md:text-xl font-bold text-white font-onest-bold">
                                Карта работы
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Background grid */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                            linear-gradient(to right, rgba(22, 153, 118, 0.37) 1px, transparent 3px),
                            linear-gradient(to bottom, rgba(22, 153, 118, 0.37) 1px, transparent 3px)
                        `,
                            backgroundSize: '75px 75px',
                        }}
                    />
                </div>

                {/* Mobile content - вертикальная компоновка с улучшенными стрелками */}
                <div className="relative z-10 w-full p-4">
                    <div className="w-full max-w-md mx-auto space-y-6">
                        {/* Принятие брифа */}
                        <WorkMapNode label="Принятие брифа" />

                        {/* Стрелка вниз - улучшенная версия */}
                        <div className="flex justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1DCD9F]">
                                <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Разработка дизайна */}
                        <WorkMapNode label="Разработка дизайна" />

                        {/* Стрелка вниз */}
                        <div className="flex justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1DCD9F]">
                                <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Осмечивание-согласование */}
                        <WorkMapNode label="Осмечивание-согласование" />

                        {/* Стрелка вниз */}
                        <div className="flex justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1DCD9F]">
                                <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Тех проработка-черчение */}
                        <WorkMapNode label="Тех проработка-черчение" />

                        {/* Стрелка вниз */}
                        <div className="flex justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1DCD9F]">
                                <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Производство */}
                        <WorkMapNode label="Производство" />

                        {/* Стрелка вниз */}
                        <div className="flex justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1DCD9F]">
                                <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Доставка */}
                        <WorkMapNode label="Доставка" />

                        {/* Стрелка вниз */}
                        <div className="flex justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1DCD9F]">
                                <path d="M12 4L12 20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Монтаж */}
                        <WorkMapNode label="Монтаж" />
                    </div>
                </div>
            </div>
        );
    }

    // Desktop layout - оригинальная сетка с уменьшенными стрелками
    return (
        <div className="relative left-1/2 -translate-x-1/2 w-screen py-16 bg-black overflow-hidden">
            {/* Title */}
            <div className="absolute top-8 left-8 z-20">
                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-xl">
                    <div className="bg-[#222] bg-opacity-70 rounded-xl px-6 py-2">
                        <h2 className="text-5xl md:text-6xl font-bold text-white">
                            Карта работы
                        </h2>
                    </div>
                </div>
            </div>

            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(22, 153, 118, 0.37) 1px, transparent 3px),
                            linear-gradient(to bottom, rgba(22, 153, 118, 0.37) 1px, transparent 3px)
                        `,
                        backgroundSize: '75px 75px',
                    }}
                />
            </div>

            {/* Main content container with responsive grid */}
            <div className="relative z-10 w-full p-8">
                <div className="w-full max-w-7xl mx-auto">
                    {/* CSS Grid Layout for exact positioning */}
                    <div className="relative w-full grid grid-cols-12 gap-4 p-4" style={{ minHeight: '600px' }}>

                        {/* SVG для стрелок */}
                        <svg
                            className="absolute inset-0 pointer-events-none z-5"
                            style={{ width: '100%', height: '100%' }}
                        >
                            {/* Принятие брифа → Разработка дизайна */}
                            <g transform="translate(250, -5) rotate(30)">
                                <svg width="72" height="215" viewBox="0 0 72 215" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M68.909 2.73804C70.2796 2.9049 71.2554 4.15125 71.0885 5.52184L68.3693 27.8569C68.2025 29.2275 66.9561 30.2033 65.5855 30.0365C64.2149 29.8696 63.2391 28.6232 63.406 27.2527L65.8231 7.39925L45.9696 4.98217C44.5991 4.8153 43.6232 3.56895 43.7901 2.19836C43.957 0.827768 45.2033 -0.148038 46.5739 0.0188158L68.909 2.73804ZM18.3171 213.508L16 214.447L12.8041 206.558L15.1212 205.619L17.4383 204.68L20.6341 212.569L18.3171 213.508ZM15.1212 205.619L12.8041 206.558C-16.4807 134.272 5.65583 51.3311 67.0657 3.25126L68.6069 5.21971L70.148 7.18816C10.4944 53.893 -11.0091 134.462 17.4383 204.68L15.1212 205.619Z" fill="white" />
                                </svg>
                            </g>

                            {/* Разработка дизайна → Тех проработка-черчение */}
                            <g transform="translate(540, 70) rotate(0)">
                                <svg width="105" height="85" viewBox="0 0 173 153" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M172.171 135.457C173.147 134.481 173.147 132.898 172.171 131.922L156.261 116.012C155.285 115.035 153.702 115.035 152.725 116.012C151.749 116.988 151.749 118.571 152.725 119.547L166.868 133.689L152.725 147.832C151.749 148.808 151.749 150.391 152.725 151.367C153.702 152.343 155.285 152.343 156.261 151.367L172.171 135.457ZM2.40308 0.689453L-2.40803e-05 1.37874L2.34668 9.56023L4.74978 8.87095L7.15288 8.18167L4.80618 0.000171125L2.40308 0.689453ZM4.74978 8.87095L2.34668 9.56023C23.8502 84.5299 92.4105 136.189 170.403 136.189V133.689V131.189C94.6409 131.189 28.0415 81.0073 7.15288 8.18167L4.74978 8.87095Z" fill="white" />
                                </svg>
                            </g>

                            {/* Тех проработка-черчение → Производство */}
                            <g transform="translate(860, 70) rotate(5)">
                                <svg width="100" height="100" viewBox="0 0 190 185" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M188.768 20.1774C189.744 19.2011 189.744 17.6182 188.768 16.6419L172.858 0.731998C171.882 -0.244312 170.299 -0.244312 169.322 0.731998C168.346 1.70831 168.346 3.29122 169.322 4.26753L183.464 18.4097L169.322 32.5518C168.346 33.5281 168.346 35.111 169.322 36.0873C170.299 37.0636 171.882 37.0636 172.858 36.0873L188.768 20.1774ZM0 182.41V184.91H30.5629V182.41V179.91H0V182.41ZM106.563 106.41H109.063V94.4097H106.563H104.063V106.41H106.563ZM182.563 18.4097V20.9097H187V18.4097V15.9097H182.563V18.4097ZM106.563 94.4097H109.063C109.063 53.8167 141.97 20.9097 182.563 20.9097V18.4097V15.9097C139.209 15.9097 104.063 51.0553 104.063 94.4097H106.563ZM30.5629 182.41V184.91C73.9173 184.91 109.063 149.764 109.063 106.41H106.563H104.063C104.063 147.003 71.1558 179.91 30.5629 179.91V182.41Z" fill="white" />
                                </svg>
                            </g>

                            {/* Производство → Доставка */}
                            <g transform="translate(960, 160) rotate(5)">
                                <svg width="130" height="118" viewBox="0 0 159 192" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M158.019 176.621C159.068 175.723 159.191 174.145 158.293 173.096L143.663 156.002C142.765 154.953 141.187 154.83 140.138 155.728C139.089 156.626 138.966 158.204 139.864 159.253L152.869 174.448L137.674 187.452C136.625 188.35 136.502 189.928 137.4 190.977C138.298 192.026 139.876 192.149 140.925 191.251L158.019 176.621ZM2.39355 0.72168L-3.33786e-06 1.4434L19.9253 67.5248L22.3188 66.8031L24.7124 66.0813L4.78711 -4.07696e-05L2.39355 0.72168ZM22.3188 66.8031L19.9253 67.5248C38.3713 128.7 92.4959 172.266 156.2 177.214L156.394 174.722L156.587 172.229C94.94 167.441 42.5628 125.282 24.7124 66.0813L22.3188 66.8031Z" fill="white" />
                                </svg>
                            </g>

                            {/* Доставка → Монтаж */}
                            <g transform="translate(1030, 530) rotate(-135)">
                                <svg width="140" height="140" viewBox="0 0 72 215" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M68.909 2.73804C70.2796 2.9049 71.2554 4.15125 71.0885 5.52184L68.3693 27.8569C68.2025 29.2275 66.9561 30.2033 65.5855 30.0365C64.2149 29.8696 63.2391 28.6232 63.406 27.2527L65.8231 7.39925L45.9696 4.98217C44.5991 4.8153 43.6232 3.56895 43.7901 2.19836C43.957 0.827768 45.2033 -0.148038 46.5739 0.0188158L68.909 2.73804ZM18.3171 213.508L16 214.447L12.8041 206.558L15.1212 205.619L17.4383 204.68L20.6341 212.569L18.3171 213.508ZM15.1212 205.619L12.8041 206.558C-16.4807 134.272 5.65583 51.3311 67.0657 3.25126L68.6069 5.21971L70.148 7.18816C10.4944 53.893 -11.0091 134.462 17.4383 204.68L15.1212 205.619Z" fill="white" />
                                </svg>
                            </g>

                            <g transform="translate(750, 450) rotate(125)">
                                <svg width="100" height="80" viewBox="0 0 173 153" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M172.171 135.457C173.147 134.481 173.147 132.898 172.171 131.922L156.261 116.012C155.285 115.035 153.702 115.035 152.725 116.012C151.749 116.988 151.749 118.571 152.725 119.547L166.868 133.689L152.725 147.832C151.749 148.808 151.749 150.391 152.725 151.367C153.702 152.343 155.285 152.343 156.261 151.367L172.171 135.457ZM2.40308 0.689453L-2.40803e-05 1.37874L2.34668 9.56023L4.74978 8.87095L7.15288 8.18167L4.80618 0.000171125L2.40308 0.689453ZM4.74978 8.87095L2.34668 9.56023C23.8502 84.5299 92.4105 136.189 170.403 136.189V133.689V131.189C94.6409 131.189 28.0415 81.0073 7.15288 8.18167L4.74978 8.87095Z" fill="white" />
                                </svg>
                            </g>

                        </svg>

                        {/* Принятие брифа - Bottom left */}
                        <div className="col-span-2 row-span-3 col-start-1 row-start-5">
                            <WorkMapNode label="Принятие брифа" />
                        </div>

                        {/* Разработка дизайна - Top middle */}
                        <div className="col-span-2 row-span-3 col-start-4 row-start-1">
                            <WorkMapNode label="Разработка дизайна" />
                        </div>

                        {/* Осмечивание-согласование - Middle right */}
                        <div className="col-span-2 row-span-3 col-start-7 row-start-3">
                            <WorkMapNode label="Осмечивание-согласование" />
                        </div>

                        {/* Тех проработка-черчение - Top right */}
                        <div className="col-span-2 row-span-3 col-start-10 row-start-1">
                            <WorkMapNode label="Тех проработка-черчение" />
                        </div>

                        {/* Производство - Far right middle */}
                        <div className="col-span-2 row-span-2 col-start-11 row-start-6">
                            <WorkMapNode label="Производство" />
                        </div>

                        {/* Доставка - Bottom right */}
                        <div className="col-span-2 row-span-2 col-start-8 row-start-8">
                            <WorkMapNode label="Доставка" />
                        </div>

                        {/* Монтаж - Bottom middle */}
                        <div className="col-span-2 row-span-2 col-start-5 row-start-9">
                            <WorkMapNode label="Монтаж" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Individual WorkMap Node Component
function WorkMapNode({ label }: { label: string }) {
    return (
        <div className="relative w-full h-full rounded-lg p-4 text-white text-center hover:scale-101 transition-transform duration-200 cursor-pointer flex items-center justify-center font-onest-medium"
            style={{
                background: 'linear-gradient(180deg, rgba(217, 217, 217, 0.20) 0%, rgba(115, 115, 115, 0.20) 100%)',
                boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(0.9px)',
                minHeight: '80px',
            }}>

            {/* Turquoise border segments */}
            {/* Top-left corner */}
            <span className="absolute top-0 left-0 w-4 h-1 bg-[#1DCD9F]"></span>
            <span className="absolute top-0 left-0 w-1 h-4 bg-[#1DCD9F]"></span>
            {/* Top-right corner */}
            <span className="absolute top-0 right-0 w-4 h-1 bg-[#1DCD9F]"></span>
            <span className="absolute top-0 right-0 w-1 h-4 bg-[#1DCD9F]"></span>
            {/* Bottom-left corner */}
            <span className="absolute bottom-0 left-0 w-4 h-1 bg-[#1DCD9F]"></span>
            <span className="absolute bottom-0 left-0 w-1 h-4 bg-[#1DCD9F]"></span>
            {/* Bottom-right corner */}
            <span className="absolute bottom-0 right-0 w-4 h-1 bg-[#1DCD9F]"></span>
            <span className="absolute bottom-0 right-0 w-1 h-4 bg-[#1DCD9F]"></span>
            {/* Top edge center */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1DCD9F]"></span>
            {/* Bottom edge center */}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1DCD9F]"></span>
            {/* Left edge center */}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1DCD9F]"></span>
            {/* Right edge center */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1DCD9F]"></span>

            {/* Text content */}
            <span className="text-sm md:text-xl font-medium relative z-10">
                {label}
            </span>
        </div>
    );
}
