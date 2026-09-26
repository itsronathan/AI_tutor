import { useSearchParams } from "react-router-dom";
import LearningModel from "./LearningModel";
import StudioBrainstorm from "./StudioBrainstorm";
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
    {architecture ? loading ? <p>Loading studio…</p> : <StudioBrainstorm key={user?.uid || "guest"} ownerId={user?.uid || "guest"} learningMode /> : <LearningModel />}
  </>;
}
