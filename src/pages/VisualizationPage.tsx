import MazeViewport from "@components/maze-canvas/MazeViewport";
import MazeControlTabs from "@components/maze-control/MazeControlTabs";

export function VisualizationPage() {
  const isSidebarOnTheRight = false;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <main
        className={`w-full flex-1 px-between-header-main-sidebar ${isSidebarOnTheRight ? "lg:order-1" : "lg:order-2"}`}
      >
        <MazeViewport containerClassName="stripes my-between-header-main-sidebar !border-primary-100" />
      </main>

      <aside
        className={`w-full border-r border-primary-100 bg-blue-25 p-between-header-main-sidebar lg:max-w-[28rem] ${isSidebarOnTheRight ? "lg:order-2" : "lg:order-1"}`}
      >
        <MazeControlTabs />
      </aside>
    </div>
  );
}

export default VisualizationPage;
