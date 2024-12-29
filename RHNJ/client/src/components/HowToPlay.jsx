import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';
import './HowToPlay.css';

export default function HowToPlay() {
  return (
    <div className='how-to-play'>
      <Navigations />
      <h1 className='htp-head-text'> How to Play Dungeons and Divas:</h1>
      <h2 className='htp-text'>Getting Started</h2>
      <p>
        First begin by creating an account. If you plan to be the DM (Diva
        Manager) of the group please select THIS LINK. If you are here to play,
        select player and continue on to create a character
      </p>
      <h2 className='htp-text'>Creating your Character</h2>
      <p>
        First choose from one of our premade character. Decide what sort of Diva
        you would like to play. If you need more character information, please
        follow THIS LINK to read the character descriptions.
      </p>
      You can either accept the default stats, or you can roll for your own
      stats. If you choose to roll, you will roll 4d6 and drop the lowest
      number. You will do this 6 times, and assign the numbers to the stats as
      you see fit.
      <p>
        Next you need to choose a flaw or two for your character. What skeletons
        does your Diva have that they would be devastated to have known or used
        against them.
      </p>
      <p>
        Lastly, you will need to choose Ideals your character will hold fast to.
        Religions, health fads, fashion requirements, etc.. Determine what hills
        your character will die on for their ideals.
      </p>
      <h2 className='htp-text'>How the Game Proceeds</h2>
      <p>
        Your DM will begin by creating a scene for you to play out, with a
        specific goal to attain. You will describe the backstory you wish your
        character to have, and proceed to play out your character's reactions to
        events as you believe they may actually react.
      </p>
      <p>
        As the story progresses, you may need to defend yourself. You will be
        told by the DM which stat you need to roll for in order to defend
        against an attack. An attack may be verbal, physical or environmental.
        Modifiers can be added to your roll depending on which stat you use.
      </p>
      <p>
        You may also have the chance to take an action. In this case you would
        use an ability or just plain attack. Most abilities can be used
        repeatedly, but some of your abilities may only be single use, and you
        will need to rest in between each use. Modifiers can be added to your
        roll depending on which stat you use.
      </p>
      <p>
        As you play, you will gain experience points which will level up your
        character. You gain new skill points when you level up, and you can use
        these to raise a stat, which can lead to increasing your modifiers as
        well.
      </p>
      <h2 className='htp-text'>Winning the Game</h2>
      <p>
        When you and your team have accomplished your event, or utterly failed
        at it, then the game will be completed.
      </p>
      <h3 className='htp-text2'>Gaining levels </h3>
      <div className='htp-div'>
        <table className='fixed_headers'>
          <thead className='htp1'>
            <tr>
              <th>Level</th>
              <th>Experience Points</th>
              <th>Stat Bonus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>0</td>
              <td>+2</td>
            </tr>
            <tr>
              <td>2</td>
              <td>300</td>
              <td>+2</td>
            </tr>
            <tr>
              <td>3</td>
              <td>900</td>
              <td>+2</td>
            </tr>
            <tr>
              <td>4</td>
              <td>2,700</td>
              <td>+2</td>
            </tr>
            <tr>
              <td>5</td>
              <td>6,500</td>
              <td>+3</td>
            </tr>
            <tr>
              <td>6</td>
              <td>14,000</td>
              <td>+3</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className='htp-text2'>Modifiers</h3>
      <div className='htp-div'>
        <table className='fixed_headers'>
          <thead className='htp1'>
            <tr>
              <th>Ability Score</th>
              <th>Modifier</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>-5</td>
            </tr>
            <tr>
              <td>2 to 3</td>
              <td>-4</td>
            </tr>
            <tr>
              <td>4 to 5</td>
              <td>-3</td>
            </tr>
            <tr>
              <td>6 to 7</td>
              <td>-2</td>
            </tr>
            <tr>
              <td>8 to 9</td>
              <td>-1</td>
            </tr>
            <tr>
              <td>10 to 11</td>
              <td>0</td>
            </tr>
            <tr>
              <td>12 to 13</td>
              <td>1</td>
            </tr>
            <tr>
              <td>14 to 15</td>
              <td>2</td>
            </tr>
            <tr>
              <td>16 to 17</td>
              <td>3</td>
            </tr>
            <tr>
              <td>18 to 19</td>
              <td>4</td>
            </tr>
            <tr>
              <td>20 to 21</td>
              <td>5</td>
            </tr>
            <tr>
              <td>22 to 23</td>
              <td>6</td>
            </tr>
            <tr>
              <td>24 to 25</td>
              <td>7</td>
            </tr>
            <tr>
              <td>26 to 27</td>
              <td>8</td>
            </tr>
            <tr>
              <td>28 to 29</td>
              <td>9</td>
            </tr>
            <tr>
              <td>30</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className='admin-login-container'>
        <Link to='/admin-login' className='navtext3'>
          Admin Login
        </Link>
      </div>
    </div>
  );
}
