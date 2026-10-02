export const PROMPTS = [
  { id: "people-arrival", theme: "People", title: "Follow an arrival", question: "Choose a person from your project. What do they notice, need, or wonder about on arrival?", exercise: "Draw six frames of their journey. Label a moment of uncertainty and a moment of welcome." },
  { id: "people-meeting", theme: "People", title: "Make room for two needs", question: "Where might people want to gather, and where might someone want to be alone?", exercise: "Sketch three ways a shared space could sit beside a quiet one." },
  { id: "site-edge", theme: "Site", title: "Work with an edge", question: "Which boundary or feature of the site could become a starting point?", exercise: "Draw three responses to that edge: follow it, cross it, and pull away from it." },
  { id: "site-ground", theme: "Site", title: "Meet the ground", question: "What possibilities emerge if your project sits on, above, or partly within the ground?", exercise: "Make three small section sketches. Mark what you know about the site and what needs checking." },
  { id: "light-sequence", theme: "Light", title: "Move through light", question: "How might a change in light help express the experience you want?", exercise: "Draw a sequence of three spaces using only light and dark shading. Record orientation assumptions." },
  { id: "light-opening", theme: "Light", title: "Change one opening", question: "What could change if the same room received light from above, beside, or through a screen?", exercise: "Keep the room constant and sketch three opening arrangements in section." },
  { id: "movement-path", theme: "Movement", title: "Find more than one path", question: "Could movement be direct, looping, or a series of pauses?", exercise: "Draw three path diagrams between the same arrival and destination. Note whom each path serves." },
  { id: "movement-threshold", theme: "Movement", title: "Design a transition", question: "Where should someone feel they are entering a different kind of space?", exercise: "Sketch a transition using changes in height, enclosure, or view. Explain the intended effect." },
  { id: "material-rule", theme: "Material", title: "Start with a making rule", question: "What spatial possibilities could come from folding, stacking, or weaving?", exercise: "Choose one operation and make three paper studies. Note a useful space in each." },
  { id: "material-contrast", theme: "Material", title: "Explore a contrast", question: "How might a relationship such as heavy/light or rough/smooth support your concept?", exercise: "Sketch the same gathering place with three material relationships. Describe what each invites." },
] as const;

export const THEMES = ["People", "Site", "Light", "Movement", "Material"] as const;
