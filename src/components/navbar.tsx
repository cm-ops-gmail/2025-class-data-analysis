'use client';

import React from 'react';
import Logo from './logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { User } from 'lucide-react';

interface NavbarProps {
    children?: React.ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
           <Link href="/teacher-profile" passHref>
             <Button variant="ghost">
                <User className="mr-2 h-4 w-4" />
                Teacher Profile
             </Button>
           </Link>
          {children}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
