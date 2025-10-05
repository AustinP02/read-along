import './about.css';

function About() {
  return (
    <div className="about-page">
      {/* Background flags */}
      <img src="https://flagcdn.com/w40/us.png" alt="USA flag" className="flag flag1" aria-hidden="true" />
      <img src="https://flagcdn.com/w40/in.png" alt="India flag" className="flag flag2" aria-hidden="true" />
      <img src="https://flagcdn.com/w40/fr.png" alt="France flag" className="flag flag3" aria-hidden="true" />
      <img src="https://flagcdn.com/w40/jp.png" alt="Japan flag" className="flag flag4" aria-hidden="true" />
      <img src="https://flagcdn.com/w40/br.png" alt="Brazil flag" className="flag flag5" aria-hidden="true" />
      <img src="https://flagcdn.com/w40/gb.png" alt="UK flag" className="flag flag6" aria-hidden="true" />

      <header className="about-header">
        <h1>ReadAlong</h1>
        <p>Make pronunciation clearer — one word at a time.</p>
      </header>

      <main>
        <section className="welcome-card" role="region" aria-labelledby="welcome-title">
          <h2 id="welcome-title">We're excited to introduce <strong>ReadAlong</strong></h2>

          {/* Announcement / welcome statement */}
          <p className="announce">
            We are proud to announce our app <strong>"ReadAlong"</strong> — a friendly, accessible tool built to help non-native English speakers,
            children, and learners of all ages perfect their pronunciation of words, speak more clearly, and become more confident, effective communicators.
            ReadAlong uses simple, welcoming practice and feedback to make speaking feel natural and enjoyable.
          </p>

          <div className="divider" aria-hidden="true"></div>

          {/* Mission statement */}
          <div className="mission" role="complementary" aria-labelledby="mission-heading">
            <h3 id="mission-heading">OUR MISSION</h3>
            <p>
              Driven by compassion and powered by research, our mission is to create an inclusive learning space where every learner —
              regardless of age or background — can develop clear pronunciation, build confidence, and discover the joy of being understood.
            </p>

            {/* Keywords badges */}
            <div className="badges" aria-hidden="false">
              <span className="badge">Driven</span>
              <span className="badge">Passionate</span>
              <span className="badge">Inclusive</span>
              <span className="badge">Supportive</span>
            </div>
          </div>

          <p className="note">Calm. Centered. Purposeful.</p>
        </section>
      </main>
    </div>
  );
}

export default About;