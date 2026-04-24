import { NARCOVI_NOTEBOOK_SHEET_CLASS } from '../../config';
import type { HarbingerJournal } from './journals';

/** Stable sourceId used by the Reveal macro to locate this journal. */
export const NARCOVI_NOTEBOOK_SOURCE_ID = 'narcovi-notebook';

/** Module flag that identifies Narcovi's Notebook instances. */
export const NARCOVI_NOTEBOOK_FLAG = 'narcovisNotebook';

const NOTEBOOK_HTML = `
<section class="narcovi-page">
	<p class="narcovi-epigraph">These notes might help me see something new. I hope so.</p>

	<h2 class="narcovi-date">Night, six days past</h2>
	<p>Body discovered in a hovel on Blood Boil, in the Lower Ward. Facts are as follows:</p>
	<ul class="narcovi-clues">
		<li>Victim was a human male, about 80 years old, found in a set of sleeping robes decorated with the sunblade of Aoskar, the Believers of the Source.</li>
		<li>Victim had a terrified expression locked on his face, his eyes wide, his mouth twisted in fear.</li>
		<li>One massive cut across the victim's abdomen produced much blood and was the apparent cause of death. The flesh was sliced open with a large, sharp blade of some sort, probably a long sword.</li>
		<li>Two messages were discovered at the scene. The first was a hand-written note on a sheet of fine parchment. It read: <span class="narcovi-quote">&ldquo;Chaos is the only law, washed clean in the blood of order.&rdquo;</span> The second was scrawled across the wall in the victim's blood. The handwriting was identical to that on the note. It read: <span class="narcovi-quote">&ldquo;Now it begins.&rdquo;</span></li>
		<li>Victim identified as <strong>Favur</strong> of the Believers of the Source, and a follower of the tenets of law. The hovel belongs to his faction.</li>
		<li>Victim was found by the housekeeper, a female gnome named <strong>Eltiva</strong>, who lives two doors down.</li>
	</ul>

	<h2 class="narcovi-date">Night, five days past</h2>
	<p>Body discovered near the Shattered Temple. Facts known:</p>
	<ul class="narcovi-clues">
		<li>Victim was a bariaur female, about 25 years old, identified as <strong>Vienna</strong> of the Athar.</li>
		<li>The following clues have led me to link this murder with the one committed last night. Victim wore a terrified expression, was killed by two cuts from a large, sharp blade, and a note on fine parchment matches the previous note exactly. There was no blood-written message this time. Those who knew her tell me she was of a lawful good persuasion.</li>
		<li>In addition to the victim, two other faction members were present in the bunkhouse last night&mdash;Defiant Munret and Karrin the Ancient. Karrin found the victim and called for assistance. Munret issued a statement, but the stink of bub around him makes his material worthless.</li>
	</ul>

	<h2 class="narcovi-date">Night, four days past</h2>
	<p>A third body fitting the pattern of what I've come to call <em>&ldquo;the Law-Killer Murders&rdquo;</em> was found in a drinking hall named The Ascension, located near the Great Foundry. The facts:</p>
	<ul class="narcovi-clues">
		<li>Victim was a female tiefling named <strong>Lini</strong>, a lawful neutral member of the Believers of the Source. She was killed by three slashes from a blade, had a look of fear etched on her face, and had a parchment note pinned to her tunic that read <span class="narcovi-quote">&ldquo;Chaos is the only law, washed clean in the blood of order.&rdquo;</span></li>
		<li>The overturned tables lead me to believe that the victim was chased around the room before being killed. She also had a strange burn mark on her arm, possibly the result of some kind of magical discharge.</li>
	</ul>

	<h2 class="narcovi-date">Night, three days past</h2>
	<p>The fourth victim of this heinous criminal was discovered in a library in the City Court. The facts:</p>
	<ul class="narcovi-clues">
		<li>Victim was a human male identified as <strong>Passa</strong> of the Fraternity of Order. The same pattern repeats itself&mdash;a look of absolute fear, wounds made by a large, sharp blade (four this time), the note with the same message. The scrolls Passa was working on have been stained with his blood.</li>
		<li>One other thing: I found traces of a white powder around the floor of the room. I took a sample and have given it to our alchemists to analyze. I showed up early on the back marble steps of the library. I wonder if it was present at the other crime scenes?</li>
	</ul>

	<h2 class="narcovi-date">Night, two days past</h2>
	<p>The latest victim of the Law-Killer has just made this situation extremely personal&mdash;I write with tears in my eyes:</p>
	<ul class="narcovi-clues">
		<li>The victim was <strong>Tenskor</strong>, a member of my team of Harmonium investigators. He was obviously chosen as a warning to the rest of the faction. Slashed five times, starting with a shallow cut across his forehead and ending with a deep slash across his gut. Terror twisted his features and the note pinned to his sleeve had an extra line added to the familiar chant: <span class="narcovi-quote">&ldquo;There is no safety in order, because chaos is everywhere.&rdquo;</span></li>
		<li>Tenskor was found on Harmonium Street in front of the City Barracks. He was staked to an X-shaped cross so that we'd all see him when we awoke. I found a small iron rod that was blackened as though a great amount of energy passed through it. No physical evidence was discovered, and none of the locals admit to hearing or seeing anything.</li>
	</ul>

	<h2 class="narcovi-date">Night, one day past</h2>
	<p>The latest victim was found at The Parted Veil bookshop on Forgotten Lane by the store's owner. The details follow:</p>
	<ul class="narcovi-clues">
		<li>Victim was a githzerai male named <strong>Keluk the Gray</strong>. The scene played like all the others: expression of genuine terror, killed by wounds made with a large blade (six slashes this time), a parchment note pinned to his shredded tunic. He was sprawled across a reading table, his blood staining a stack of books that explained the tenets of law and order.</li>
		<li>The shop owner, <strong>Kesto Brighteyes</strong>, discovered the body when he opened the store the next morning. He provided details on what he saw and assured me he didn't touch anything.</li>
	</ul>

	<p class="narcovi-closing">For all these clues, I'm no closer to solving this maddening case than I was when the first victim was found. If only I had something new to go on&hellip;</p>

	<p class="narcovi-signature">&mdash; Narcovi</p>
</section>
`.trim();

export const NARCOVI_NOTEBOOK_JOURNAL: HarbingerJournal = {
	id: NARCOVI_NOTEBOOK_SOURCE_ID,
	name: "Narcovi's Notebook",
	folder: 'Reference',
	sort: 9500,
	sheetClass: NARCOVI_NOTEBOOK_SHEET_CLASS,
	moduleFlags: {
		[NARCOVI_NOTEBOOK_FLAG]: true,
	},
	pages: [
		{
			name: "Narcovi's Notebook",
			type: 'text',
			title: {
				show: false,
				level: 1,
			},
			text: {
				content: NOTEBOOK_HTML,
				format: 1,
			},
		},
	],
};
