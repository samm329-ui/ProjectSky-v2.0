import { ConstellationData } from '@/types';

export const constellations: ConstellationData[] = [
    {
        id: 'social',
        label: 'Social Constellation',
        position: 'top-left',
        links: [
            { id: 'twitter', label: 'Twitter / X', icon: 'twitter', url: 'https://twitter.com/YOUR_HANDLE' },
            { id: 'instagram', label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/YOUR_HANDLE' },
            { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/in/YOUR_HANDLE' },
        ],
    },
    {
        id: 'portfolio',
        label: 'Portfolio Constellation',
        position: 'top-right',
        links: [
            { id: 'github', label: 'GitHub', icon: 'github', url: 'https://github.com/YOUR_HANDLE' },
            { id: 'portfolio', label: 'My Portfolio', icon: 'briefcase', url: 'https://yourportfolio.com' },
        ],
    },
    {
        id: 'projects',
        label: 'Projects Constellation',
        position: 'bottom-left',
        links: [
            { id: 'code', label: 'View Projects', icon: 'code', url: '#', openModal: true },
            { id: 'laptop', label: 'Live Demos', icon: 'laptop', url: 'https://yoursite.com/demos' },
        ],
        modalLinks: [
            { id: 'proj1', label: 'Project One', icon: 'link', url: 'https://project1.com' },
            { id: 'proj2', label: 'Project Two', icon: 'link', url: 'https://project2.com' },
            { id: 'proj3', label: 'Project Three', icon: 'link', url: 'https://project3.com' },
        ],
    },
    {
        id: 'knowledge',
        label: 'Knowledge Constellation',
        position: 'bottom-right',
        links: [
            { id: 'blog', label: 'Blog', icon: 'book', url: '#', openModal: true },
            { id: 'tips', label: 'Tips', icon: 'bulb', url: 'https://yourblog.com' },
        ],
        modalLinks: [
            { id: 'article1', label: 'Article One', icon: 'link', url: 'https://article1.com' },
            { id: 'article2', label: 'Article Two', icon: 'link', url: 'https://article2.com' },
        ],
    },
];
