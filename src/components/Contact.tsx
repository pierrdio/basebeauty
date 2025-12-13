'use client'

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Contact() {
    const [fileName, setFileName] = useState("Прикрепите файл");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("Прикрепите файл");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            toast.error('Пожалуйста, введите название проекта');
            return;
        }
        
        if (!formData.phone.trim()) {
            toast.error('Пожалуйста, введите телефон');
            return;
        }
        
        if (!formData.message.trim()) {
            toast.error('Пожалуйста, опишите задачу');
            return;
        }
        
        // Phone validation (more flexible for Russian numbers)
        const phoneRegex = /^[\d\s\-\(\)]+$/;
        const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Пожалуйста, введите номер телефона (только цифры, скобки, дефисы)');
            return;
        }
        
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            toast.error('Пожалуйста, введите корректный номер телефона (10-11 цифр)');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formElement = e.target as HTMLFormElement;
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('message', formData.message);
            
            const fileInput = formElement.querySelector('#file') as HTMLInputElement;
            if (fileInput.files && fileInput.files[0]) {
                formDataToSend.append('file', fileInput.files[0]);
            }

            const response = await fetch('/api/contact/submit', {
                method: 'POST',
                body: formDataToSend
            });

            if (response.ok) {
                const result = await response.json();
                toast.success('Проект успешно отправлен! Мы свяжемся с вами в ближайшее время.');
                
                // Reset form
                setFormData({ name: '', phone: '', message: '' });
                setFileName('Прикрепите файл');
                formElement.reset();
            } else {
                const error = await response.json();
                toast.error(`Ошибка: ${error.error || 'Не удалось отправить проект'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Произошла ошибка при отправке проекта');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <section id="contact" className="relative left-1/2 -translate-x-1/2 w-screen py-16 bg-black mt-10">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <Card className="bg-black border-none shadow-none">
                            <div className="p-px bg-linear-to-bl from-gray-500 via-gray-900 to-stone-200 rounded-lg">
                                <div className="bg-black rounded-lg p-6 flex flex-col gap-10">
                                    <CardHeader>
                                        <div className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl">
                                            <div className="bg-black rounded-full">
                                                <CardTitle className="text-white p-3 bg-[#222222] rounded-xl text-center w-full text-5xl">Обсудить проект</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit}>
                                            <div className="flex flex-col gap-8">
                                                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                                                    <div className="bg-black rounded-lg">
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            type="text"
                                                            placeholder="НАЗВАНИЕ ПРОЕКТА"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            className="bg-[#222222] text-white text-lg font-medium placeholder:text-white placeholder:text-lg border-0 rounded-lg py-6"
                                                            maxLength={100}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                                                    <div className="bg-black rounded-lg">
                                                        <Input
                                                            id="phone"
                                                            name="phone"
                                                            type="tel"
                                                            placeholder="+7"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            className="bg-[#222222] text-white text-lg font-medium placeholder:text-white placeholder:text-lg border-0 rounded-lg py-6"
                                                            maxLength={18}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                                                    <div className="bg-black rounded-lg relative">
                                                        <Input
                                                            id="message"
                                                            name="message"
                                                            placeholder="ОПИШИТЕ ЗАДАЧУ"
                                                            value={formData.message}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-[#222222] text-white text-lg font-medium placeholder:text-white placeholder:text-lg border-0 rounded-lg py-6 px-4 pr-16 h-25 resize-none"
                                                            maxLength={250}
                                                            required
                                                        />
                                                        <div className="absolute bottom-3 right-3">
                                                            <span className={`text-xs ${formData.message.length >= 200 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                                {formData.message.length}/250
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-950 to-stone-400 rounded-lg">
                                                    <div className="bg-black rounded-lg relative">
                                                        <Input
                                                            id="file"
                                                            name="file"
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            accept=".pdf, .doc, .docx, .jpg, .jpeg, .png, .gif, .webp, .zip, .rar"
                                                            onChange={handleFileChange}
                                                        />
                                                        <div className="bg-[#222222] text-white uppercase font-medium py-3 px-3 rounded-lg border-0 flex h-13 cursor-pointer hover:bg-[#444444] transition-colors text-lg">
                                                            <span>{fileName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <Button 
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className={`w-full text-4xl p-8 cursor-pointer mx-auto text-white transition-all duration-300 ${
                                                            isSubmitting 
                                                                ? 'bg-blue-600 hover:bg-blue-700 scale-95 opacity-90' 
                                                                : 'bg-[#222222] hover:bg-[#444444] hover:scale-105'
                                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="flex items-center justify-center gap-3">
                                                                <Loader2 className="w-8 h-8 animate-spin" />
                                                                <span>Отправка...</span>
                                                            </div>
                                                        ) : (
                                                            'Отправить'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="flex justify-center lg:justify-end flex-col gap-5 my-6">
                        <div className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl">
                            <div className="bg-black rounded-full">
                                <CardTitle className="text-white p-3 bg-[#222222] rounded-xl text-center w-full text-5xl">Где мы находимся</CardTitle>
                            </div>
                        </div>
                        <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A43a8b9689fc779a25d7a0fa2f9cff04ad88ee701dc4baaba69eeb53ca2c4e18c&amp;source=constructor" className="rounded-xl max-w-full h-[475px]"></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
}