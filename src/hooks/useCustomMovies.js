import { useState, useEffect } from 'react';

const customMovies = [
    {
        id: 1,
        background: "/src/assets/Img/deadpool.jpg",
        display_background: "/src/assets/Img/deadpool.jpg",
        title: "Deadpool Wolverine",
        description: "The iconic duo is back in a hilarious, action-packed adventure filled with chaos and surprises.",
        duration: "2h 10m",
        poster_path: "/src/assets/Img/deadpool.jpg",
        release_date: "2024",
        vote_average: 8.5,
        resource_name: "deadpool_wolverine",
    },
    {
        id: 2,
        background: "/src/assets/Img/endgame.jpg",
        display_background: "/src/assets/Img/endgame.jpg",
        title: "Avengers Endgame",
        description: "The Avengers reunite for one final stand against Thanos in a battle to save the universe.",
        duration: "3h 2m",
        poster_path: "/src/assets/Img/endgame.jpg",
        release_date: "2019",
        vote_average: 8.4,
        resource_name: "avengers_endgame",

    },
    {
        id: 3,
        background: "/src/assets/Img/gru.jpg",
        display_background: "/src/assets/Img/gru.jpg",
        title: "Despicable Me 4",
        description: "Gru and his mischievous minions return, facing hilarious challenges while embracing family life.",
        duration: "1h 35m",
        poster_path: "/src/assets/Img/gru.jpg",
        release_date: "2024",
        vote_average: 7.8,
        resource_name: "dispicable_me_4",

    },
    {
        id: 4,
        background: "/src/assets/Img/family_guy.jpg",
        display_background: "/src/assets/Img/family_guy.jpg",
        title: "Family Guy - Its A Trap",
        description: "Join the Griffin family in this hilarious, twisted Star Wars parody that reimagines Return of the Jedi.",
        duration: "45m",
        poster_path: "/src/assets/Img/family_guy.jpg",
        release_date: "2010",
        vote_average: 7.2,
        resource_name: "family_guy",
    },
    {
        id: 5,
        background: "/src/assets/Img/inter.jpg",
        display_background: "/src/assets/Img/inter.jpg",
        title: "Interstellar",
        description: "An emotional space odyssey that follows a team of astronauts searching for a new home for humanity.",
        duration: "2h 49m",
        poster_path: "/src/assets/Img/inter.jpg",
        release_date: "2014",
        vote_average: 8.6,
        resource_name: "interstellar",
    },
    {
        id: 6,
        background: "/src/assets/Img/panda.jpg",
        display_background: "/src/assets/Img/panda.jpg",
        title: "Kung Fu Panda - Secrets Of The Masters",
        description: "Witness the legendary kung fu masters' origins and discover their incredible stories of courage.",
        duration: "1h 30m",
        poster_path: "/src/assets/Img/panda.jpg",
        release_date: "2011",
        vote_average: 7.5,
        resource_name: "kung_fu_panda",
    },
    {
        id: 7,
        background: "/src/assets/Img/minions.jpg",
        display_background: "/src/assets/Img/minions.jpg",
        title: "Minions - The Rise Of Gru",
        description: "Join the minions on a chaotic and hilarious quest as they help young Gru become the world's greatest villain.",
        duration: "1h 27m",
        poster_path: "/src/assets/Img/minions.jpg",
        release_date: "2022",
        vote_average: 7.4,
        resource_name: "minions",
    },
    {
        id: 8,
        background: "/src/assets/Img/puss.jpg",
        display_background: "/src/assets/Img/puss.jpg",
        title: "Puss In Boots - The Last Wish",
        description: "Puss sets out on a daring quest to find the mythical Last Wish, facing thrilling adventures along the way.",
        duration: "1h 40m",
        poster_path: "/src/assets/Img/puss.jpg",
        release_date: "2022",
        vote_average: 7.8,
        resource_name: "puss_in_boots",
    },
    {
        id: 9,
        background: "/src/assets/Img/suzume.jpg",
        display_background: "/src/assets/Img/suzume.jpg",
        title: "Suzume",
        description: "A breathtaking anime tale about a girl's mystical journey to close mysterious doors causing chaos across Japan.",
        duration: "2h 1m",
        poster_path: "/src/assets/Img/suzume.jpg",
        release_date: "2022",
        vote_average: 7.7,
        resource_name: "suzume",
    },
    {
        id: 10,
        background: "/src/assets/Img/the_gorge.jpg",
        display_background: "/src/assets/Img/the_gorge.jpg",
        title: "The Gorge",
        description: "A gripping survival thriller set in the wilderness, where dark secrets unravel as survival instincts clash.",
        duration: "1h 55m",
        poster_path: "/src/assets/Img/the_gorge.jpg",
        release_date: "2023",
        vote_average: 6.8,
        resource_name: "the_gorge",
    }
];

export const useCustomMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setMovies(customMovies);
            setLoading(false);
        }, 500);
    }, []);

    return { movies, loading };
}; 