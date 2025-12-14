import HeroRelease from "./HeroRelease";
import HeroWorks from "./HeroWorks";

export default function Hero() {
    return (
        <section className="py-10 px-4 flex flex-col xl:flex-row gap-6 xl:gap-8 items-stretch">
            <HeroRelease />
            <HeroWorks />
        </section>
    );
}