export const quotesLibrary = {
    fitness: [
        "Victory is won in the quiet hours while the world sleeps.",
        "Your body is the vessel that carries your ambition.",
        "Sweat is just fat crying. Keep pushing.",
        "You don't get the ass you want by sitting on it.",
        "Discipline is doing what needs to be done, even if you don't want to.",
        "Pain is temporary. Quitting lasts forever.",
        "Respect your body. It’s the only place you have to live.",
        "The only bad workout is the one that didn't happen.",
        "Train like a beast, look like a beauty.",
        "Stronger than yesterday."
    ],
    planning: [
        "A goal without a plan is just a wish.",
        "Either you run the day or the day runs you.",
        "Strategic thinking beats hard work every time.",
        "Measure twice, cut once.",
        "Focus on being productive instead of busy.",
        "The time to repair the roof is when the sun is shining.",
        "By failing to prepare, you are preparing to fail.",
        "Clarity is power.",
        "Win the morning, win the day.",
        "Design your future, or someone else will."
    ],
    household: [
        "How you do anything is how you do everything.",
        "A clean space is a clear mind.",
        "Order your environment, order your thoughts.",
        "Respect your sanctuary.",
        "Small disciplines lead to great achievements.",
        "Detail matters.",
        "Excellence is a habit.",
        "Take pride in the small things.",
        "Simplicity is the ultimate sophistication.",
        "Create an environment of success."
    ],
    content: [
        "Creativity is intelligence having fun.",
        "Document, don't just create.",
        "Your voice matters. Use it.",
        "Done is better than perfect.",
        "Value beats production quality every time.",
        "Create to impact, not just to impress.",
        "Consistency is the key to growth.",
        "Storytelling is the most powerful way to put ideas into the world.",
        "Be authentic. Everyone else is already taken.",
        "Quality is the best business plan."
    ],
    finance: [
        "Knowledge is power, but sharing it is impact.",
        "Compound interest is the eighth wonder of the world.",
        "Don't work for money; make it work for you.",
        "Financial freedom is available to those who learn about it.",
        "The best investment you can make is in yourself.",
        "Price is what you pay. Value is what you get.",
        "Rich people buy time. Poor people sell time.",
        "Money is a terrible master but an excellent servant.",
        "Risk comes from not knowing what you're doing.",
        "Fortune favors the bold."
    ],
    learning: [
        "Invest in your mind. The ROI is infinite.",
        "The more you learn, the more you earn.",
        "Expertise is the only valid currency.",
        "Stay hungry, stay foolish.",
        "Formal education will make you a living; self-education will make you a fortune.",
        "Skills are cheap. Passion is priceless.",
        "Continuous improvement is better than delayed perfection.",
        "Today a reader, tomorrow a leader.",
        "Knowledge has no value unless you use it.",
        "Mastery demands focus."
    ],
    practice: [
        "Amateurs practice until they get it right. Professionals practice until they can't get it wrong.",
        "Repetition is the mother of learning.",
        "Hard work beats talent when talent doesn't work hard.",
        "Focus is the new IQ.",
        "Deep work is the superpower of the 21st century.",
        "Success is the sum of small efforts, repeated day in and day out.",
        "Don't watch the clock; do what it does. Keep going.",
        "The difference between ordinary and extraordinary is that little extra.",
        "Grind in silence, let success make the noise.",
        "It always seems impossible until it's done."
    ],
    rest: [
        "Rest is not idleness. It's sharpening the axe.",
        "Recharge to dominate.",
        "You can't pour from an empty cup.",
        "Sleep is the best meditation.",
        "Relaxation is the stepping stone to tranquility.",
        "Breathe. You've got this.",
        "A well-spent day brings happy sleep.",
        "Resting is part of the work.",
        "Disconnect to reconnect.",
        "Silence is a source of great strength."
    ],
    general: [
        "Make today a masterpiece.",
        "Action is the foundational key to all success.",
        "Don't wait for opportunity. Create it.",
        "Believe you can and you're halfway there.",
        "Your only limit is you.",
        "Dream big and dare to fail.",
        "Turn your wounds into wisdom.",
        "The future depends on what you do today.",
        "Do it with passion or not at all.",
        "Be the change you wish to see in the world."
    ]
};

export const getRandomQuote = (category = 'general') => {
    // Safety check: ensure category is a string and valid key, else default to general
    const key = (typeof category === 'string' ? category.toLowerCase() : 'general');
    const list = quotesLibrary[key] || quotesLibrary.general;

    // Ultimate fallback if list is somehow empty/undefined
    if (!list || list.length === 0) return "Stay focused.";

    return list[Math.floor(Math.random() * list.length)];
};
