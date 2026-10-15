import { useSearchParams } from "react-router-dom";
import LearningModel from "./LearningModel";
import ArchitectureLearning from "./ArchitectureLearning";
import { useAuth } from "./context/AuthContext";
import "./LearningMode.css";

export default function LearningMode() {
  const [params, setParams] = useSearchParams();
  const architecture = params.get("course") === "architecture";
  const { user, loading } = useAuth();
  return <>
    <div className="learning-course-switch">
      <label htmlFor="learning-course">Learning mode</label>
      <select id="learning-course" value={architecture ? "architecture" : "textbook"} onChange={event => {
        const next = new URLSearchParams(params);
        next.set("course", event.target.value);
        setParams(next);
      }}>
        <option value="textbook">Textbook learning</option>
        <option value="architecture">Architectural Design Studio</option>
      </select>
    </div>
    {architecture ? loading ? <p>Loading lessons…</p> : <ArchitectureLearning ownerId={user?.uid || "guest"} /> : <LearningModel />}
  </>;
}
