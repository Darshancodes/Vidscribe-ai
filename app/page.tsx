

import Companies from "@/components/marketing/companies";
import Hero from "@/components/marketing/hero";
import Background from "@/components/global/background";


import { Spotlight } from "@/components/ui/spotlight";
import Wrapper from "@/components/global/wrapper";
import Container from "@/components/global/container";
//import Connect from "@/components/marketing/connect";
import Features from "@/components/marketing/features";
import Perks from "@/components/marketing/perks";
import Reviews from "@/components/marketing/reviews";
import CTA from "@/components/marketing/cta";

const Home = () => {
  return (
      <Background>
          <Wrapper className="py-20 relative">
              <Container className="relative">
                  <Spotlight
                      className="-top-40 left-0 md:left-60 md:-top-20"
                      fill="rgba(255, 255, 255, 0.5)"
                  />
                  <Hero />
              </Container>
              <Container className="py-6 lg:py-20">
                  <Companies />
              </Container>
              {/*<Connect />*/}
              <Features />
              <Perks />
              <Reviews />
              <CTA />
          </Wrapper>
      </Background>
  );
};

export default Home;
