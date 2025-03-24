"use client"
import { ArrowRight, Github, Sparkles, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function Footer() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = async (data: any) => {
        // Handle newsletter submission
        console.log(data);
        reset();
    };

    const links = {
        product: [
            { name: 'Pricing', href: '/pricing' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
        ],
        legal: [
            { name: 'Privacy', href: '/privacy' },
        ],
    };

    return (
        <footer className="border-t bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Brand */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold">Wiley Swift Reunion</span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                        The next Wiley-Swift Reunion will be held July 25-27, 2025 in Washington DC. Our "home" for the weekend will be at the Hilton Alexandria Old Town, in historic Alexandria, Virginia. This is a perfect venue for a weekend in DC!
                        </p>
                    </div>

                    {/* Links */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Merch</h3>
                                <ul className="mt-4 space-y-4">
                                    {links.product.map((item) => (
                                        <li key={item.name}>
                                            <Link href={item.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reunion</h3>
                                <ul className="mt-4 space-y-4">
                                    {links.company.map((item) => (
                                        <li key={item.name}>
                                            <Link href={item.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stay Updated</h3>
                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Subscribe to our newsletter for updates.
                            </p>
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:flex sm:max-w-md">
                                <div className="flex-1">
                                    <Input
                                        {...register('email', { required: true })}
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full min-w-0 rounded-full border-gray-300"
                                    />
                                </div>
                                <div className="mt-3 sm:ml-3 sm:mt-0">
                                    <Button type="submit" className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white">
                                        Subscribe
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} Wiley Swift Reunion. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
