import { Star } from "lucide-react";

const Testimonials = () => {
    const dummyTestimonialData = [
        {
            image: "https://ashk.vercel.app/images/Profile%20image.jpeg",
            name: 'Ashutosh Singh',
            title: 'Content Creator',
            content: 'QuickAI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours of work every week.',
            rating: 5,
        },
        {
            image: "https://www.shrianshagarwal.in/images/personal.jpeg",
            name: 'Shriansh Agarwal',
            title: 'Content Developer',
            content: 'QuickAI has made my content creation process effortless. The AI tools have helped us produce high-quality content faster than ever before.',
            rating: 5,
        },
        {
            image: "https://rare-gallery.com/thumbs/1035392-painting-illustration-Gentleman-cartoon-brand-clothing-James-Moriarty-Sherlock.jpg",
            name: 'Jim Moriarty',
            title: 'Content Generator',
            content: 'QuickAI has transformed our content generation process. The AI tools have helped us produce high-quality content faster than ever before.',
            rating: 4,
        },
    ]

    return (
        <div className='py-24 px-4 sm:px-6 lg:px-8 bg-background'>
            <div className='text-center max-w-3xl mx-auto mb-16'>
                <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>Loved by Creators</h2>
                <p className='text-lg text-muted-foreground'>Don't just take our word for it. Here's what our users are saying.</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                {dummyTestimonialData.map((testimonial, index) => (
                    <div key={index} className='bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow'>
                        <div className="flex items-center gap-1 mb-6">
                            {Array(5).fill(0).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <p className='text-foreground mb-6 leading-relaxed'>"{testimonial.content}"</p>

                        <div className='flex items-center gap-4 pt-6 border-t border-border'>
                            <img src={testimonial.image} className='w-12 h-12 object-cover rounded-full' alt={testimonial.name} />
                            <div>
                                <h3 className='font-semibold text-foreground'>{testimonial.name}</h3>
                                <p className='text-sm text-muted-foreground'>{testimonial.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Testimonials;
