# Sim Finder

### FreeSO Dashboard for both Sims and Houses
 
The Sim Finder is an interactive dashboard where you can view both sim and house data on [FreeSO](https://github.com/riperiperi/FreeSO). The Sim Finder aims to improve on aspects lacking by the previous [dashboard](https://dashboard.thecode.house/), adding many new ease-of-use and helpful features.

# Features
- View information from any sim or house
	- When viewing, you get a comprehensive breakdown of the inspected entity's information
	- Offline entities can be searched by name
- Keep track of your favorite sims by bookmarking them
	- The sim finder bookmark system is much more responsive than the one present in-game, which only updates when the game is launched
	- Bookmark lists are exportable and sharable with others
	- The bookmark export is an easily producible JSON format, useful for automating selection of sims
		- As an example, it is very easy to generate a bookmark list of sims whose avatar_ids are in the range 1 to 100
- View currently active sim jobs and the city's current time
- User-defined custom styles for sims and houses
	- Users can decorate their sim or house breakdown by adding a sequence of style indicators to their in-game 		descriptions
	- View the [Style Wiki](https://github.com/Sam-Chug/sim-finder/wiki/Custom-Sim-Panel-Styles) for more information on building a style sequence for your sim or house
- Several useful filters for all entities
	- Houses can be filtered by their lot category
		- Includes lots with no selected category, which are normally hard to find in-game
	- There are many filters for finding sims with specific traits
		- All sim jobs are filterable, and you are able to locate sims currently working at their job (useful for teleporting directly to your sim's workplace)
		- Locate sims with privacy mode turned on (somewhat limited, inspected sim must be present at their house)
		- Detect what house a sim is currently visiting, or if they are floating (not currently present at a house, but logged in)
		- View staff/moderator sims currently online (not comprehensive, only compares to a list of known staff sims)
- View the current market breakdown
	- Draws from all sims at money houses and at sim jobs
	- Calculates from list of averaged money-per-second values, and takes into account an estimate of each sim's current skill levels (which effect pay data)
	- Displays a snapshot of city-wide earnings at the time of page load