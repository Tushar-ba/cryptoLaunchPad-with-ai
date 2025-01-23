import { useState, useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import CreateProject from '@/components/CreateProject';
import ProjectList from '@/components/ProjectList';
import InvestProject from '@/components/InvestProject';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-900">
            <ProjectList />
        </div>
    );
};

export default Home;
