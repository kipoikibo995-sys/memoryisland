export type Memory = {
  id: string; title: string; date: string; time: string; chapter: string;
  story: string; note: string;
  /** Vĩ độ, kinh độ theo độ. Vật thể tự hướng theo pháp tuyến. */
  position: [number, number];
  kind: 'beach' | 'hill' | 'house' | 'harbor' | 'forest' | 'lighthouse' | 'garden' | 'stargazing' | 'coral' | 'cafe';
  image?: string; imageAlt?: string;
};
export const trip = {
  id: 'mua-he-minh-di-tron-2026',
  title: 'Our little summer',
  location: 'Cloud Island · somewhere we remember',
  date: 'June 12–15, 2026',
  description: 'A few days without a plan. Salt on our skin, sunlight in our pockets, and ten little moments worth keeping.',
  /** Thêm /audio/song-bien.mp3 và đặt tệp trong public/audio để bật nút âm thanh. */
  audio: undefined as string | undefined,
  memories: [
    {id:'ban-mai',title:"Dawn Beach",date:'2026-06-12',time:'05:42',chapter:"Day one · A gentle beginning",kind:'beach',position:[14,-36],story:"We reached the shore before the island woke. You brought two coffees; I forgot my shoes. Slowly, the sun turned the little waves pink. We barely said a word. Somehow, I already knew these were the days we would want to keep.",note:"Coffee, salt air, and a morning with you."},
    {id:'doi-gio',title:"Windward Hill",date:'2026-06-12',time:'16:30',chapter:"Day one · A little closer to the sky",kind:'hill',position:[49,6],story:"The path was longer than we expected. At the top, the wind tangled our hair and stole our map. We sat in the grass and shared an orange. The sea stretched out below us. Beside me was someone who made silence feel like home.",note:"For once, there was nothing more to wish for."},
    {id:'nha-nho',title:"The Little House",date:'2026-06-13',time:'09:15',chapter:"Day two · Somewhere to slow down",kind:'house',position:[24,35],story:"The house had green shutters and flowers leaning over the path. Our host left a pot of warm tea and told us to make ourselves at home. Sunlight crept across the windowsill while we planned a whole day of doing very little. For the first time in ages, I forgot to check the time.",note:"Sometimes home is simply a place that lets you slow down."},
    {id:'ben-thuyen',title:"Quiet Harbor",date:'2026-06-13',time:'17:40',chapter:"Day two · Following the last light",kind:'harbor',position:[-21,70],story:"The boatman told his stories slowly, as though the sea had taught him how. Our wooden boat carried us through the last ribbon of sunlight. You pointed to a cloud shaped like a cat. I thought it looked like a loaf of bread. We laughed all the way back.",note:"Some joys are small enough to hold in your hands."},
    {id:'rung-xanh',title:"Fernwood Forest",date:'2026-06-14',time:'10:20',chapter:"Day three · A lovely wrong turn",kind:'forest',position:[8,149],story:"We missed the turn and found a clearing full of sunlight. The leaves sounded like the softest rain. You picked up a heart-shaped leaf and tucked it into my notebook. Getting lost, it turned out, could bring us somewhere we never knew we needed.",note:"The leaf is still there, between pages twelve and thirteen."},
    {id:'hai-dang',title:"The Lighthouse",date:'2026-06-15',time:'06:10',chapter:"Our last day · A promise to return",kind:'lighthouse',position:[-12,-124],story:"On our last morning, we climbed the lighthouse. The winding stairs made me dizzy, but the view took my breath away. Before we left, you said we should stay longer next time. I kept those words like a ticket with no return date.",note:"The trip ends. The good days stay."},
    {id:'vuon-hoa',title:"Wildflower Garden",date:'2026-06-14',time:'15:05',chapter:"Day three · A pocketful of sunshine",kind:'garden',position:[52,100],story:"After the rain, we found a garden blooming beside a little hillside path. The gardener gave us each a stem and reminded us to put them in water. You tucked a yellow flower into the strap of my bag. All afternoon, I kept looking down and smiling.",note:"One small flower can brighten an entire day."},
    {id:'cau-ngam-sao',title:"Stargazer’s Pier",date:'2026-06-14',time:'21:10',chapter:"Day three · Under the same sky",kind:'stargazing',position:[45,-85],story:"The wooden pier reached out into the dark. Water whispered against its posts. We lay down to count the stars and soon forgot our place. You told me about a dream you had never shared. I could not promise all the answers, only that I would keep listening.",note:"Under an endless sky, the world felt wonderfully small."},
    {id:'vinh-san-ho',title:"Coral Cove",date:'2026-06-15',time:'09:20',chapter:"Our last day · Beneath the surface",kind:'coral',position:[-46,155],story:"The water was so clear we could see fish threading through the reef from our little boat. I put on my mask, nervous, and you held my hand until I was ready. Beneath the surface, everything grew quiet. A beautiful world was waiting just beyond my hesitation.",note:"Thank you for holding my hand at the beginning."},
    {id:'quan-ven-bien',title:"Seaside Café",date:'2026-06-15',time:'15:00',chapter:"Our last day · One more cup",kind:'cafe',position:[-48,-85],story:"Before the ferry home, we stopped at a café with an orange awning. Two lemon teas left rings on the wooden table. My notebook was full of crooked handwriting. On the last page, you wrote: see you again, Cloud Island. I drew a tiny boat beneath it, so our promise could find its way back.",note:"We came home with fewer things and more memories."},
  ] satisfies Memory[],
};
