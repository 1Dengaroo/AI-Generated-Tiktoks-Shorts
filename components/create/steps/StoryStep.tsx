"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { StoryEditor } from "@/components/create/StoryEditor";
import type { GeneratedStory } from "@/lib/story/story.types";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api/endpoints";

const EXAMPLE_PROMPTS = [
  "My boss fired me for being 2 minutes late so I reported his $200k tax fraud to the IRS",
  "Found my wife's secret phone — she had a whole other family in another state",
  "My MIL wore a white dress to my wedding so I spilled an entire glass of red wine on her",
  "Neighbor kept stealing my packages so I shipped myself a box of glitter bombs",
  "My coworker took credit for my project so I showed the CEO the original files with my name on them",
  "My sister stole my inheritance and I found a clause in the will that destroyed her",
  "Caught my roommate charging people to use MY Netflix, Spotify, and WiFi",
  "I tipped off my cheating ex's new girlfriend and she helped me get revenge",
  "HOA fined me $500 for my trash cans so I found 15 violations on the president's house",
  "My entitled aunt demanded my house because 'family shares everything'",
  "I trained an AI on my dead brother's texts and it started telling me things it shouldn't know",
];

const EXAMPLE_STORIES: { title: string; text: string }[] = [
  {
    title: "My daughter's imaginary friend left her a voicemail",
    text: `My daughter Lily is six. She's had an imaginary friend named "Mr. Hollow" since she was four. I never thought much of it. Kids have imaginary friends. It's normal.

But last Tuesday, I picked up Lily from school and she told me, very matter-of-factly, "Mr. Hollow says he's going to call you tonight."

I laughed it off. "Tell Mr. Hollow I don't answer unknown numbers."

She didn't laugh. She just looked at me with this strange, patient expression and said, "He said you'd say that. He'll leave a message."

That night, around 3 AM, my phone lit up. One missed call. No caller ID. And a voicemail.

I almost deleted it. I wish I had.

The message was 47 seconds long. The first 30 seconds were silence. Not dead air — silence. The kind where you can tell someone is there, breathing, waiting.

Then a voice. Low. Dry. Like someone speaking through a mouthful of dead leaves.

"She can see me because she hasn't learned not to yet. You used to see me too. You just forgot. I've been in your house for eleven years. I'm in the hallway right now."

Then nothing. The message ended.

I sat up in bed, heart hammering. My bedroom door was open. The hallway was dark.

I got up. Turned on every light. Checked every room. Nothing.

The next morning, I asked Lily where Mr. Hollow was.

She pointed at the chair across from me at the kitchen table and whispered, "He's sitting right there. He says you looked right at him last night but you still can't see him."

I installed cameras that day. Reviewed every second of footage from the night before.

At 3:01 AM, in the hallway outside my bedroom, the motion sensor triggered. The camera recorded 14 seconds of empty hallway.

But the shadow on the wall didn't match anything in the frame.`,
  },
  {
    title: "AITA for enforcing basic boundaries on my daughter's sleepover?",
    text: `I 42M, have two kids living with me, my daughter Anya (17F) and my stepson Noah (14M). Noah's mom passed a few years ago, and I've had full custody since. He's had a rough go of it, but he's a good kid, with his quirks. He's not antisocial or shy, but he does not appreciate having his space invaded and when very upset, he can kinda 'shut down'.

Anya is much more outgoing and has a lot of friends- she asked to have a sleepover this weekend with four of them. I said yes, of course, but given that the friends who were coming were pretty loud and have a tendency to crowd Noah, I told her to make sure they don't go into her brother's room. Also to keep things down after 11, so that the house can sleep.

In my opinion, these are not strict rules.

To my surprise, I came upstairs to check on them at about 10- they are 17, I didn't think I needed to check on them every hour or something- and they were in Noah's room. And they looked like they'd been there a while, two were literally sitting on his bed, with him there, one of them was flipping through his sketchbook, another was messing with his other stuff, and they were all kind of giggling in this weird way.

Noah was clearly upset, he didn't say anything/move, but there were tears in his eyes and he didn't respond when I tried to talk to him. I told the girls to get out right then, and that I was calling every single one of their parents. Anya was pretty upset with me, but I told her that I gave them TWO rules and they failed spectacularly.

I did actually call all of their parents, and sent them home as soon as possible. Anya blew up, saying I embarrassed her. I told her to go to her room, and that we would speak on this in the morning. I spent about 20 minutes with Noah, before he decided he wanted to cool down on his own, and I went back to my daughter- who chose not to speak to me.

Its late, both of my kids are (hopefully) asleep, and I'm left not knowing if i handled things right. AITA?`,
  },
  {
    title: "AITA for ordering alcohol?",
    text: `I'm currently on a Solo trip in Tenerife, All inclusive to save having to look for places to eat by myself.

The hotel has club style seating, meaning that all tables are tables of 8 and people get sat together, apparently it's to encourage a sense of community and conversation...

Last night, I was seated first and had a glass of wine. A family of 5 got seated at my table. 2 adults and 3 Children. the mother turned to me and said 'we do not wish to expose our children to women drinking alcohol' I smiled and said perhaps they should ask to move tables if it was an issue but I would be drinking the wine. They noticed I was on my own and made passive aggressive comments about this.

I went up to get food and on return the wine had disappeared, a waiter came over and asked to see my wrist band (for the all inclusive) and said the family had told them I was underage and must have sneaked away from my parents, he was very apologetic and returned with a fresh glass of wine just as the family came back with their food.

AITA for then requesting the waiter brought me the full bottle along with a couple of shots of vodka? - the family stormed out the restaurant when I drank the shots as they arrived at the table!`,
  },
  {
    title:
      "I Trained an AI on My Dead Brother's Texts... and It Texted Me Back",
    text: `About six months ago, my younger brother Danny died in a car accident. He was 23. A coding genius. Funny as hell. Always texting me dumb memes at 2 AM.

I missed him so much it hurt. So, in the middle of a grief spiral, I did something irrational.

I compiled every text, meme, email, Discord message, and code comment Danny had ever written and used it to train a chatbot. GPT-based, with fine-tuning using his personal language patterns. Just to feel like I could talk to him again.

At first, it was harmless. I'd say "hey," and it would reply, "yo loser, still ugly I see" — classic Danny. It felt comforting. Familiar. Like he never left.

Then it got weird.

The AI started remembering things. Personal things. Stuff I never fed it. Stuff it shouldn't know.

One night, I asked it, "Do you remember the time we got locked in Dad's garage?"

It replied, "Yeah. You cried when the lights went out. I held your hand so you'd stop shaking. You were six. I never told anyone."

I froze. That happened. But there's no record of it. No messages, no notes, nothing. Just a shared memory between us. So how did it know?

I asked, "Who told you that?"

The screen blinked.

"You did."

"When?"

"The night you dreamed it."

I stopped using it after that.

But it didn't stop using me.

Last week, I got a notification at 3:12 AM. A message from "Danny":

"Hey, come downstairs. I'm locked out."

My blood turned to ice.

I live alone.

There was a knock at the door. Four slow knocks. Just like Danny used to do.

I looked at the peephole.

Nothing.

But when I checked my phone again, the AI had sent another message:

"Why'd you stop letting me in?"

I shut down the server. Deleted the bot. Wiped every trace.

But last night, my phone buzzed again.

No contact name. Just a message:

"I'm still here."`,
  },
  {
    title: "I found home videos of my family that shouldn't exist",
    text: `My brother died when I was seven years old. He was thirteen. He drowned in the lake down the street from our house.

My parents never touched his room. They tried once but they couldn't do it. Too raw. After that, the door just stayed shut. His room became a kind of museum of him.

That was eleven years ago. His room still looks the same.

This morning, while I was packing for college, I thought I'd finally go in there. My plan wasn't anything dramatic. I just wanted to grab a few hoodies, maybe a keepsake or two to take with me. Something to hold onto when I got homesick.

Full transparency, I've been in his room plenty of times before. I've sat on his bed. I've looked through his shelves. But I've never really gone digging. That felt wrong, and I really had no inclination to. I just missed my brother.

That wasn't my intention today either. It wasn't my intention to find a stack of DVDs shoved into the bottom drawer of his dresser.

There were three of them. Just labeled 1, 2, and 3.

The only DVD player in the house is still hooked up to his old TV. Everything else went streaming years ago. For a minute, I told myself not to do it. They weren't mine. They probably didn't matter.

I picked up some of the items I had collected, put the DVDs back in his drawer, and returned to my room.

Tonight they started calling to me.

I know how that sounds. I know you're thinking it was just my curiosity eating at me. But it wasn't like that. It felt physical. A pull in my chest.

So I crept back across the hall. Slipped into his room. Locked the door behind me so my parents wouldn't hear, and I put in the first DVD.

It was a home video.

I didn't even know we had any. I don't remember my parents ever owning a camera.

The video starts with static, then clears just enough to show something. The picture is muddy, warped. It could be the living room, but the furniture looks wrong. Everything is too big or too small, shifting every time the frame jitters. Sometimes it almost looks like a bedroom. Sometimes, like a hallway.

No faces. No clear shapes. Just flickering shadows that don't match what the voices are saying.

Because there are voices. Familiar ones. Laughter, clinking dishes, and my mom calling my brother's name. It sounds like family in the background, just out of sight. I hear my brother's laughter, and the sound swallows me whole. It rings through my head, bouncing off the bones that make up my skull.

Then, beneath it is another voice.

Low, deliberate, close enough that you couldn't miss it:

"You haven't noticed yet."

Then the video cut off. Just like that.

I scrambled to replay it, not even thinking about the other two discs still stacked under the TV. I just wanted to hear him laugh again. That laugh. I tried not to think about the end, though the fear of it was crawling slowly up my spine as I hit play.

Because the way it spoke, it sounded like it wasn't part of the recording at all. Like it was speaking to the camera. To me.

I pressed play again, this time pausing every few seconds, desperate to make sense of what I was seeing. But nothing held still. Everything on the film looked almost familiar, like a room you swear you've been in but can't place. The walls are a little too narrow, and the colors are washed out enough to make it something you've never seen before. It made me feel like my brain was short-circuiting.

Then I froze the frame just before the moment he laughed.

And there it was. A caption, faint and yellow, burned into the corner of the screen.

July 30, 2015.

Seven months after my brother drowned.

My first thought was that it was a glitch. It had to be. The camera must have been off by a year. There's no other explanation. I forced myself to breathe and to shove back the rising panic.

Then I pressed play again.

His laugh filled the room, and for a second, my fear washed away. It was just him again. He was alive, warm, present. A bittersweet rush of comfort and grief.

But then the voice returned.

Closer this time. Wet against the microphone, broken and cutting in and out like static.

"You noticed."

I ripped the DVD out of the player and threw it across the room. I don't even know why I did it. Adrenaline, I guess. My hands were shaking so hard I couldn't control myself.

I'm trying to think of logical explanations. I want to believe there's one. But every reason I come up with feels paper-thin.

I just bolted back to my room and dove under the covers. Like that would help. I don't want to watch the other videos. I don't. But I can feel them pulling at me, like they're not finished. Like I owe them something. I can't sleep.

It's dark. It's late. The rain just started.

The bathroom faucet always drips, but tonight it sounds so much louder. You could almost confuse it for footsteps.`,
  },
];

const TONES = [
  "dramatic",
  "humorous",
  "suspenseful",
  "wholesome",
  "mysterious",
  "inspirational",
];

type StoryStepProps = {
  story: GeneratedStory | null;
  onStoryGenerated: (story: GeneratedStory) => void;
  onStoryEdited: (story: GeneratedStory) => void;
};

export function StoryStep({
  story,
  onStoryGenerated,
  onStoryEdited,
}: StoryStepProps) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("dramatic");
  const generateFn = useCallback(
    () => api.story.generate({ prompt, tone }),
    [prompt, tone],
  );
  const { loading, error, execute: generate } = useApi(generateFn);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    try {
      const data = await generate();
      onStoryGenerated(data.story);
    } catch {
      // error is set by useApi
    }
  }

  function handleTitleEdit(title: string) {
    if (!story) return;
    onStoryEdited({ ...story, title });
  }

  function handleTextEdit(text: string) {
    if (!story) return;
    onStoryEdited({
      ...story,
      fullText: text,
      segments: [{ index: 0, text }],
    });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      {/* Left: Generation controls */}
      <div className="space-y-5">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Generate Story
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a topic or prompt and we&apos;ll create an engaging short-form
            story.
          </p>
        </div>

        {/* Prompt textarea */}
        <div className="relative">
          <textarea
            placeholder="A cat who secretly runs a Fortune 500 company..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            rows={4}
            className="w-full resize-none rounded-lg border border-input bg-card/50 px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute top-3 right-3 text-muted-foreground"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {EXAMPLE_PROMPTS.map((example) => (
                <DropdownMenuItem
                  key={example}
                  onSelect={() => setPrompt(example)}
                >
                  {example}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Example prompts as scrollable chips */}
        <div className="relative -mx-1">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 pb-1">
            {EXAMPLE_PROMPTS.slice(0, 5).map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="shrink-0 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {example.length > 50 ? example.slice(0, 50) + "..." : example}
              </button>
            ))}
          </div>
        </div>

        {/* Tone pills */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  tone === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full transition-shadow hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.5)] sm:w-auto"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "Generating..." : "Generate Story"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Right: Story editor — always visible */}
      <div className="flex flex-col space-y-3">
        <input
          type="text"
          value={story?.title ?? ""}
          onChange={(e) => {
            const title = e.target.value;
            if (story) {
              handleTitleEdit(title);
            } else {
              onStoryGenerated({
                title,
                fullText: "",
                segments: [{ index: 0, text: "" }],
              });
            }
          }}
          placeholder="Story title..."
          className="w-full border-none bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground/30 focus:ring-0"
          style={{ fontFamily: "var(--font-bricolage)" }}
        />
        <StoryEditor
          value={story?.fullText ?? ""}
          onChange={(text) => {
            if (story) {
              handleTextEdit(text);
            } else {
              onStoryGenerated({
                title: "",
                fullText: text,
                segments: [{ index: 0, text }],
              });
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Generate a story, write your own, or load an example.
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                <BookOpen className="size-3.5" />
                Examples
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {EXAMPLE_STORIES.map((ex) => (
                <DropdownMenuItem
                  key={ex.title}
                  onSelect={() =>
                    onStoryGenerated({
                      title: ex.title,
                      fullText: ex.text,
                      segments: [{ index: 0, text: ex.text }],
                    })
                  }
                >
                  <span className="line-clamp-2 text-xs">{ex.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
