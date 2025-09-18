import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
const Layout = () => {
   const userName = localStorage.getItem('name') || 'Guest';
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="h-[100px] flex w-screen bg-black md:px-20 md:py-4 justify-between items-center border-b-2 border-red-300 sticky top-0 z-50">
  <div>
    <img src="/logo1.png" className="h-30 w-40" />
  </div>

  <div className="flex gap-4">
    <div className="flex flex-col items-center justify-center gap-1">
      <span className="text-green-500 text-sm font-semibold">{userName}</span>
      {/* <span className="text-green-500 text-sm font-semibold">Patient</span> */}
    </div>

    <div className="rounded-full w-10 h-10 border border-red-200 flex justify-center items-center relative">
      <img src="/User-Profile-PNG-File.png" className="w-full h-full cover " />
      <div className="h-3 w-3 rounded-full bg-green-400 border-[1px] border-white absolute top-0 right-0"></div>
    </div>
  </div>
</div>

        <div className="flex">
               <div className="fixed  left-0 h-full z-50">
        <Sidebar />
      </div>
      <div className="flex-1 ml-[120px] bg-doc">
        <Outlet />
      </div>
        </div>
   
    </div>
  );
};

export default Layout