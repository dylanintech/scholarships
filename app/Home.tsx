'use client';

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface Application {
    id: string,
    name: string,
    user_id: string, //maybe turn into UUID type
    created_at: any,
}

export default function Home() {
    const [applications, setApplications] = useState<Application[] | null>(null);
    const [loading, setLoading] = useState(false);
    // session state here
    // supabase state here
    const [avatarURL, setAvatarURL] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [applicationCount, setApplicationCount] = useState<number | null>(null);
    const [credits, setCredits] = useState<number | null>(null);
    //applicaiton component state
    const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);
    const [currentApplicationName, setCurrentApplicationName] = useState<string | null>(null);
    const [creatingNewApplication, setCreatingNewApplication] = useState<boolean>(false);
    //user state
    const [bio, setBio] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    //output
    const [output, setOutput] = useState<string>('');


    const handleNewApplication = (newApplication: Application) => {
        if (applications) {
            setApplications([...applications, newApplication])
        }
        if (!applications) {
            setApplications([newApplication])
        }
    }

    //function to copy to clipboard
    const copyToClipboard = async (str: string) => {
        await navigator.clipboard.writeText(str);
    }

    const generateEssay = async () => {
        try {
            if (bio && prompt) {
                setLoading(true);
                const res = await fetch('/api/generate', {
                    method: "put",
                    body: JSON.stringify({ bio: bio, prompt: prompt, }),
                })
        
                const { response } = await res.json();
    
                if (response) {
                    setOutput(response);
                    console.log(response);
                    setLoading(false);
                }
            } else {
                alert('please enter a bio and prompt :)');
            }
        } catch (error) {
            console.log('error generating essay', error);
        }
    }


    return (
        <div className="flex flex-col w-full min-h-screen bg-[url('https://nextjs.org/static/images/commerce/gradient-1.png')] p-2">
            <div className="flex flex-row mb-2 items-center justify-between">
                <h1 className="text-black text-2xl">scholarshipessay<span className="text-purple-400">inspo</span></h1>
                <a className="text-black underline" href="https://notionforms.io/forms/scholarshipessayinspo-feedback-e3mbie" target="none">feedback</a>
            </div>
            <div className="flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-1">
                    <label htmlFor="bio" className="text-black">enter a short bio (try to be as specific as possible lol):</label>
                    <textarea
                    className="shadow-md rounded-md p-2 ring ring-gray-500 text-black"
                    placeholder="senior in high school, founder at flywheel, 2x startup accelerator graduate at buildspace, fullstack dev, building nexgen with friends (a community of 900 young & ambitious startup founders). prev: founding enginer at Baro Capital, founder at Art.sol."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    name="bio"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="prompt" className="text-black">enter your essay prompt:</label>
                    <textarea 
                    className="shadow-md bg-white w-full p-2 rounded-md ring ring-gray-500 text-black"
                    placeholder="Please tell us why you think math is important and why you love learning math."
                    name="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>
              <div className="flex flex-row justify-start">
                  <button 
                  onClick={(e) => generateEssay()}
                  className="flex shadow-md flex-row gap-1 items-center bg-purple-400 rounded-md w-1/8 p-2 hover:bg-purple-300"
                  >
                    <p className="text-white">generate essay inspo</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </button>
              </div>
          </div>
          {loading && 
             <div className="flex flex-col shadow-md rounded-md bg-white p-2 ring ring-gray-500 mt-4">
                <Skeleton baseColor="purple" count={5} />
             </div>
          }
          {!loading && output && 
                <div className="flex flex-col shadow-md rounded-md bg-white p-2 ring ring-gray-500 mt-4">
                     {/* <div className="flex flex-row justify-end items-center">
                        <button 
                        onClick={(e) => copyToClipboard(output)}
                        className="p-1 rounded-md shadow-md bg-black hover:bg-gray-800 w-10 h-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-clipboard"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                        </button>
                    </div> */}
                    <p className="text-black">{output}</p>
                </div>
          }
       </div> 
    )

}