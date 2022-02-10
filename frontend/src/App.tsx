import {
  FormEvent,
  FormEventHandler,
  LegacyRef,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";

interface IEmojiRes {
  question: string;
  answer: string;
  emojis: string[];
}

const host = "api/";
const App = () => {
  const [emojis, setEmojis] = useState<IEmojiRes | null>();
  const [isCorrect, setIsCorrect] = useState<boolean | null>();

  const formRef = useRef<HTMLFormElement>(null);

  const loadCaptcha = () => {
    setIsCorrect(null);
    formRef.current?.reset();
    fetch(host + "captcha").then(async (res) => setEmojis(await res.json()));
  };
  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(data);

    const res = await fetch(host + "submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formProps, answer: emojis?.answer }),
    });

    const jsonres = await res.json();
    setIsCorrect(jsonres.isCorrect);
  };
  if (!emojis) {
    return <h1>Hold on we are fetching emojis</h1>;
  }
  return (
    <div className="App">
      <h1>Welcome to Emoji Captcha</h1>
      <p>Say hi to next gen emoji captchas 👋</p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          defaultValue="Cool guy"
          className="name"
          required
          placeholder="Your name"
        />
        <p>Please select {emojis.question} </p>
        <div className="emoji-container">
          {emojis.emojis.map((emo, idx) => (
            <div className="emoji" key={idx}>
              <input
                required
                type="radio"
                name="selectedEmoji"
                value={idx}
                id={idx + ""}
              />
              <label htmlFor={idx + ""}>
                <img src={emo} alt="I am sorry that you cant see me" />
              </label>
            </div>
          ))}
        </div>
        <button onClick={loadCaptcha}>Get another</button>
        <br />
        <button className="submit">Submit</button>
      </form>
      <div className="result-box">
        {isCorrect === false ? (
          <h2 className="red">Oops! Thats not right 😩</h2>
        ) : isCorrect === true ? (
          <h2 className="green">Yay! You picked the right emoji 😇</h2>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default App;
