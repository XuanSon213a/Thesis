import clothPic from'./assets/images/about.jpg';


function Content (){
  return(
    <section >
    <div className="grid md:grid-cols-2 gap-x-40  text-left md:items-center+text-top   p-20 ">
      <div className="md-2 space-y-7 text-left w-[624px] h-[700px]   ">
          <h1 className="text-[64px] font-bold " >About</h1>
          <p className='text-[24px] text-gray-400 leading-9' >Subheading for description or instructions</p>
          <p className="text-[24px] font-medium leading-8 ">Body text for your whole article or post. We’ll put in some lorem ipsum to show how a filled-out page might look:</p>
          <p className='text-[24px] font-medium leading-8'>
            Excepteur efficient emerging, minim veniam anim aute carefully curated Ginza conversation exquisite perfect nostrud nisi intricate Content. Qui  international first-class nulla ut. Punctual adipisicing, essential lovely queen tempor eiusmod irure. Exclusive izakaya charming Scandinavian impeccable aute quality of life soft power pariatur Melbourne occaecat discerning. Qui wardrobe aliquip, et Porter destination Toto remarkable officia Helsinki excepteur Basset hound. Zürich sleepy perfect consectetur.</p>
      </div>
      <div >
          <img src={clothPic} className="  w-full  rounded-lg " alt="shirtcloth" />
      </div>
    </div>
    </section>
  );
}

export default Content;