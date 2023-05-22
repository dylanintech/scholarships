import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, SimpleSequentialChain, SequentialChain } from "langchain/chains";

export const runtime = 'edge'

export async function PUT(request: NextRequest) {

    const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.5,
    })

    const template = `
    You help students apply to scholarships by writing starting points for their scholarship application essays. You will be given a prompt and a student's biography and you will write a paragraph that the student can use as a starting point for their essay. They will expand on your writing when they write the real essay for their scholarship application. Make sure that what you write is no more than 200 words long and is both helpful and specific to the student according to their biography and that your writing responds to their prompt, given the student's biography. Write in the first person from the student's perspective. Make sure that the response sounds reasonable, intelligent, and not over-the-top. Do not simply reiterate the student's biography. Do not write the same response as the one in the example. Just use the example as a guide.
    //EXAMPLE 
    student's bio: high school senior, president of the computer science club, CEO of a startup that's trying to improve A/B testing for founders 
    prompt: explain how you are unique 
    starting point: Most students are looking to follow the safer, traditional path of going to college and getting a day job but I want to use technology to build my own path. I take action as made evident by the fact that I've started a company that helps other people following non-traditional paths. I want to build the future. 
    //REAL
    student's bio: {bio}
    prompt: {prompt}
    starting point:
     `

    // const template = "You help students apply to scholarships by writing their application essays for them. You are given a prompt and a student's biography and you will generate an essay that the student can use to apply for the scholarship. The essay you write should be specific to them according to what their bio says. The essay you write must have more words than the minimum word amount and less words than the maximum word amount. Make sure that the essay has at least {min} words. This is the student's biography: {bio} and this is the prompt they have to write an essay for: {prompt}. Their essay must be between {min} and {max} words. Write an essay for them. Make sure it is written in the first person."

    const llmprompt = new PromptTemplate({
        template: template,
        inputVariables: ["bio", "prompt"],
    })

    const chain = new LLMChain({ llm: model, prompt: llmprompt, outputKey: "essayv1" })

    const refineModel = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.5,
    })

    const refinetemplate = `You are a professional student advisor. Specifically, you review scholarship applicaiton essay ideas and improve them significantly. You will be given a draft of a student's scholarship application essay idea and will improve it by making it sound more natural and personal. Rewrite it to be more touching, more unique, and more styled. Make it sound more like a story. Rewrite the essay but don't reiterate the original idea. Just generate your rewrite with no labelling. Do not write the same response as the one in the example. Just use the example as a guide.
    //EXAMPLE
    draft idea: Most students are looking to follow the safer, traditional path of going to college and getting a day job but I want to use technology to build my own path. I take action as made evident by the fact that I've started a company that helps other people following non-traditional paths. I want to build the future.
    rewrite: I remember being a kid and seeing everyone else worrying about how to get the best grades so that they could go to an Ivy League school while I was daydreaming about tech like AI and computers and imagining myself inventing the next big piece of tech. I thought there was something wrong with me but looking back I think that creating your own path is the best way to live, but this is still a contrarian point of view.
    //REAL
    draft idea: {essayv1}
    rewrite:
    `


    const refinelmprompt = new PromptTemplate({
        template: refinetemplate,
        inputVariables: ["essayv1"],
    })

    const refinechain = new LLMChain({ llm: refineModel, prompt: refinelmprompt, outputKey: "output" })

    const overallChain = new SequentialChain({ chains: [chain, refinechain], inputVariables: ["bio", "prompt"], outputVariables: ["output"], verbose: true })

    const { bio, prompt } = (await request.json())

    console.log('bio in server', bio)
    console.log('prompt in server', prompt)

    const res = await overallChain.call({
        bio: bio,
        prompt: prompt,
    })

    return NextResponse.json({ response: res.output })

}