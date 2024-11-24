import Images from "../global/images";
import Marquee from "../ui/maruqee";

const Companies = () => {
  return (
    // Removed py-20 and reduced py-2 to py-1
    <div className="flex w-full">
      <div className="flex flex-col items-center justify-center text-center w-full py-1">
        <h2 className="text-xl heading">Powered by</h2>
        <div className="flex  items-center mt-12 gap-x-0">
          <Images.company1 className="w-28 h-8" />
          <Images.company2 className="w-28 h-6" />
        </div>
        {/* <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div> */}
      </div>
    </div>
  );
};

export default Companies;