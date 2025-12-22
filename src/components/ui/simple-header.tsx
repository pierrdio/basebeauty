import React from 'react';
import { Grid2x2PlusIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggle } from '@/components/ui/menu-toggle';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export function SimpleHeader() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const links = [
		{
			label: 'Главная',
			href: '/',
		},
		{
			label: 'Портфолио',
			href: '#portfolio',
		},
		{
			label: 'Обсудить',
			href: '#contact',
		},
	];

	const handleLinkClick = (href: string) => {
		if (href.startsWith('#')) {
			// Если это якорь и мы не на главной странице
			if (pathname !== '/') {
				// Переходим на главную с якорем
				router.push('/' + href);
			} else {
				// Если уже на главной, просто скроллим к якорю
				const element = document.querySelector(href);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
				}
			}
		} else {
			// Обычная навигация
			router.push(href);
		}
		setOpen(false);
	};

	return (
		<header className="z-50 w-full bg-[#272727]/80 backdrop-blur-md fixed py-6 ">
			<nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<Image
						src="/Base_Logo_Simple.svg"
						alt="BaseBeauty Logo"
						width={120}
						height={120}
					/>
				</Link>
				<div className="hidden items-center gap-2 lg:flex">
					{links.map((link) => (
						<div key={link.href} className='w-full relative flex'>
							<button
								className={buttonVariants({ className: 'text-white text-xl font-onest-medium group relative w-max m-1 bg-transparent hover:bg-transparent' })}
								onClick={() => handleLinkClick(link.href)}
							>
								{link.label}
								<span className='absolute -bottom-1 left-0 w-0 transition-all duration-300 ease-in-out h-0.5 bg-white group-hover:w-full'></span>
							</button>
						</div>
					))}
				</div>
				<Sheet open={open} onOpenChange={setOpen}>
					<Button size="icon" variant="outline" className="lg:hidden">
						<MenuToggle
							strokeWidth={2.5}
							open={open}
							onOpenChange={setOpen}
							className="size-6"
						/>
					</Button>
					<SheetContent
						className="bg-background/95 supports-backdrop-filter:bg-background/80 gap-0 backdrop-blur-lg"
						side="left"
					>
						<div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
							{links.map((link) => (
								<button
									key={link.href}
									className={buttonVariants({
										variant: 'ghost',
										className: 'justify-start font-onest-medium w-full text-left',
									})}
									onClick={() => handleLinkClick(link.href)}
								>
									{link.label}
								</button>
							))}
						</div>
					</SheetContent>
				</Sheet>
			</nav>
		</header>
	);
}
