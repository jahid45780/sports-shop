import type { SportMatch, SportType, MatchStatus, MatchEvent } from '../types/index.ts';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttlMs });
}

// Timeout fetch helper to protect against hanging external requests
async function fetchWithTimeout(url: string, timeoutMs: number = 4000): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ApexKit-SportsEngine/1.0',
        'Accept': 'application/json'
      }
    });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    return null;
  }
}

// 1. Fetch Soccer Scoreboard
async function fetchSoccerMatches(): Promise<SportMatch[]> {
  const cacheKey = 'sports_soccer_matches';
  const cached = getFromCache<SportMatch[]>(cacheKey);
  if (cached) return cached;

  const leagues = [
    { slug: 'eng.1', name: 'English Premier League' },
    { slug: 'esp.1', name: 'Spanish La Liga' },
    { slug: 'uefa.champions', name: 'UEFA Champions League' },
    { slug: 'ita.1', name: 'Italian Serie A' },
    { slug: 'ger.1', name: 'German Bundesliga' }
  ];

  const results: SportMatch[] = [];

  const promises = leagues.map(async (league) => {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard`;
    const data = await fetchWithTimeout(url);
    if (!data || !data.events) return;

    for (const event of data.events) {
      try {
        const comp = event.competitions?.[0];
        if (!comp) continue;

        const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home') || comp.competitors?.[0];
        const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away') || comp.competitors?.[1];

        if (!homeComp || !awayComp) continue;

        const state = event.status?.type?.state; // 'pre' | 'in' | 'post'
        let status: MatchStatus = 'upcoming';
        let statusText = event.status?.type?.description || 'Upcoming';

        if (state === 'in') {
          status = 'live';
          const clock = event.status?.displayClock ? `${event.status.displayClock}'` : 'LIVE';
          statusText = `LIVE ${clock}`;
        } else if (state === 'post') {
          status = 'completed';
          statusText = event.status?.type?.description || 'Full Time (FT)';
        }

        const match: SportMatch = {
          id: `fb-${event.id}`,
          sport: 'football',
          competition: league.name,
          competitionSlug: league.slug,
          leagueLogo: data.leagues?.[0]?.logos?.[0]?.href,
          round: event.season?.type?.name,
          homeTeam: {
            name: homeComp.team?.displayName || 'Home Team',
            shortName: homeComp.team?.abbreviation || homeComp.team?.shortDisplayName || 'HOME',
            logo: homeComp.team?.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${homeComp.id}.png`,
            score: homeComp.score !== undefined ? homeComp.score : (status === 'upcoming' ? undefined : 0),
            isWinner: homeComp.winner
          },
          awayTeam: {
            name: awayComp.team?.displayName || 'Away Team',
            shortName: awayComp.team?.abbreviation || awayComp.team?.shortDisplayName || 'AWAY',
            logo: awayComp.team?.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${awayComp.id}.png`,
            score: awayComp.score !== undefined ? awayComp.score : (status === 'upcoming' ? undefined : 0),
            isWinner: awayComp.winner
          },
          status,
          statusText,
          matchTime: event.date || new Date().toISOString(),
          venue: comp.venue?.fullName || 'Stadium',
          minute: event.status?.displayClock,
          isVerified: true,
          dataSource: status === 'live' ? 'live_feed' : (status === 'upcoming' ? 'official_schedule' : 'verified_archive')
        };

        results.push(match);
      } catch (e) {
        // Continue on single match parse error
      }
    }
  });

  await Promise.allSettled(promises);
  setCache(cacheKey, results, 45 * 1000); // 45 sec TTL
  return results;
}

// 2. Fetch Basketball (NBA) Scoreboard
async function fetchBasketballMatches(): Promise<SportMatch[]> {
  const cacheKey = 'sports_basketball_matches';
  const cached = getFromCache<SportMatch[]>(cacheKey);
  if (cached) return cached;

  const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
  const data = await fetchWithTimeout(url);
  const results: SportMatch[] = [];

  if (data && data.events) {
    for (const event of data.events) {
      try {
        const comp = event.competitions?.[0];
        if (!comp) continue;

        const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home') || comp.competitors?.[0];
        const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away') || comp.competitors?.[1];

        if (!homeComp || !awayComp) continue;

        const state = event.status?.type?.state;
        let status: MatchStatus = 'upcoming';
        let statusText = event.status?.type?.description || 'Scheduled';

        if (state === 'in') {
          status = 'live';
          const clock = event.status?.displayClock || '';
          const period = event.status?.period ? `Q${event.status.period}` : '';
          statusText = `LIVE ${period} ${clock}`.trim();
        } else if (state === 'post') {
          status = 'completed';
          statusText = event.status?.type?.description || 'Final';
        }

        const match: SportMatch = {
          id: `bb-${event.id}`,
          sport: 'basketball',
          competition: 'NBA (National Basketball Association)',
          competitionSlug: 'nba',
          leagueLogo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
          round: event.season?.type?.name || 'Regular Season',
          homeTeam: {
            name: homeComp.team?.displayName || 'Home',
            shortName: homeComp.team?.abbreviation || 'HOM',
            logo: homeComp.team?.logo,
            score: homeComp.score,
            linescores: homeComp.linescores?.map((l: any) => String(l.value || l.displayValue || '')),
            isWinner: homeComp.winner
          },
          awayTeam: {
            name: awayComp.team?.displayName || 'Away',
            shortName: awayComp.team?.abbreviation || 'AWY',
            logo: awayComp.team?.logo,
            score: awayComp.score,
            linescores: awayComp.linescores?.map((l: any) => String(l.value || l.displayValue || '')),
            isWinner: awayComp.winner
          },
          status,
          statusText,
          matchTime: event.date || new Date().toISOString(),
          venue: comp.venue?.fullName || 'Arena',
          minute: event.status?.displayClock,
          isVerified: true,
          dataSource: status === 'live' ? 'live_feed' : (status === 'upcoming' ? 'official_schedule' : 'verified_archive')
        };

        results.push(match);
      } catch (e) {
        // Skip malformed item
      }
    }
  }

  setCache(cacheKey, results, 45 * 1000);
  return results;
}

// 3. Fetch Cricket Scoreboard
async function fetchCricketMatches(): Promise<SportMatch[]> {
  const cacheKey = 'sports_cricket_matches';
  const cached = getFromCache<SportMatch[]>(cacheKey);
  if (cached) return cached;

  const url = 'https://site.web.api.espn.com/apis/personalized/v2/scoreboard/header?sport=cricket';
  const data = await fetchWithTimeout(url);
  const results: SportMatch[] = [];

  if (data && data.sports?.[0]?.leagues) {
    for (const league of data.sports[0].leagues) {
      const leagueName = league.name || 'Cricket Championship';
      if (!league.events) continue;

      for (const event of league.events) {
        try {
          const comps = event.competitors || [];
          if (comps.length < 2) continue;

          const team1 = comps[0];
          const team2 = comps[1];

          let status: MatchStatus = 'upcoming';
          let statusText = event.summary || event.status || 'Scheduled';

          if (event.status === 'in') {
            status = 'live';
            statusText = event.summary ? `LIVE · ${event.summary}` : 'LIVE IN PROGRESS';
          } else if (event.status === 'post' || event.status === 'complete') {
            status = 'completed';
            statusText = event.summary || 'Match Finished';
          }

          const match: SportMatch = {
            id: `cr-${event.id || event.uid || Math.random().toString(36).substring(7)}`,
            sport: 'cricket',
            competition: leagueName,
            competitionSlug: league.slug || 'cricket',
            round: typeof event.group === 'object' ? (event.group?.name || event.group?.shortName || 'Tournament') : String(event.group || 'Tour Match'),
            homeTeam: {
              name: team1.name || team1.displayName || 'Team 1',
              shortName: team1.abbreviation || team1.shortName || team1.name || 'T1',
              score: team1.score || '',
              subScore: team1.score ? team1.score : undefined,
              isWinner: team1.isWinner
            },
            awayTeam: {
              name: team2.name || team2.displayName || 'Team 2',
              shortName: team2.abbreviation || team2.shortName || team2.name || 'T2',
              score: team2.score || '',
              subScore: team2.score ? team2.score : undefined,
              isWinner: team2.isWinner
            },
            status,
            statusText,
            matchTime: event.date || new Date().toISOString(),
            venue: event.location || 'Cricket Ground',
            isVerified: true,
            dataSource: status === 'live' ? 'live_feed' : (status === 'upcoming' ? 'official_schedule' : 'verified_archive')
          };

          results.push(match);
        } catch (e) {
          // Skip
        }
      }
    }
  }

  setCache(cacheKey, results, 45 * 1000);
  return results;
}

// 4. Combined Multi-Sport Aggregator
export async function getLiveSportsFeed(params: {
  sport?: string;
  status?: string;
  league?: string;
  search?: string;
}): Promise<{
  matches: SportMatch[];
  liveCount: number;
  upcomingCount: number;
  completedCount: number;
  lastUpdated: string;
  sportsAvailable: string[];
  providerInfo: {
    providerName: string;
    isLiveFeedActive: boolean;
    updateFrequency: string;
  };
}> {
  const [soccer, basketball, cricket] = await Promise.all([
    fetchSoccerMatches(),
    fetchBasketballMatches(),
    fetchCricketMatches()
  ]);

  let allMatches: SportMatch[] = [...soccer, ...cricket, ...basketball];

  // Sport Filter
  if (params.sport && params.sport !== 'all') {
    const s = params.sport.toLowerCase();
    allMatches = allMatches.filter(m => m.sport === s);
  }

  // League Filter
  if (params.league && params.league !== 'all') {
    const l = params.league.toLowerCase();
    allMatches = allMatches.filter(m => 
      m.competition.toLowerCase().includes(l) ||
      m.competitionSlug?.toLowerCase() === l
    );
  }

  // Search Filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    allMatches = allMatches.filter(m => 
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      m.competition.toLowerCase().includes(q) ||
      (m.venue && m.venue.toLowerCase().includes(q))
    );
  }

  // Compute status counts before status filtering
  const liveCount = allMatches.filter(m => m.status === 'live').length;
  const upcomingCount = allMatches.filter(m => m.status === 'upcoming').length;
  const completedCount = allMatches.filter(m => m.status === 'completed').length;

  // Status Filter
  if (params.status && params.status !== 'all') {
    allMatches = allMatches.filter(m => m.status === params.status);
  }

  // Sort matches: Live first, then by match time (upcoming ascending, completed descending)
  allMatches.sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;

    const timeA = new Date(a.matchTime).getTime();
    const timeB = new Date(b.matchTime).getTime();

    if (a.status === 'upcoming' && b.status === 'upcoming') {
      return timeA - timeB; // Earliest upcoming first
    }
    return timeB - timeA; // Most recent completed first
  });

  return {
    matches: allMatches,
    liveCount,
    upcomingCount,
    completedCount,
    lastUpdated: new Date().toISOString(),
    sportsAvailable: ['football', 'cricket', 'basketball'],
    providerInfo: {
      providerName: 'ESPN & Global Sports Telemetry Network',
      isLiveFeedActive: true,
      updateFrequency: 'Live scores refreshed every 45-60s'
    }
  };
}

// 5. Match Details by ID
export async function getMatchDetails(matchId: string): Promise<{
  match: SportMatch | null;
  events?: MatchEvent[];
  stats?: any;
  lineups?: any;
  venueInfo?: { name: string; city?: string; capacity?: number };
}> {
  const cacheKey = `match_details_${matchId}`;
  const cached = getFromCache<any>(cacheKey);
  if (cached) return cached;

  // Parse ID prefix
  if (matchId.startsWith('fb-')) {
    const eventId = matchId.replace('fb-', '');
    const leagues = ['eng.1', 'esp.1', 'uefa.champions', 'ita.1', 'ger.1'];

    for (const league of leagues) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${eventId}`;
      const data = await fetchWithTimeout(url, 4000);
      if (data && data.header) {
        const comp = data.header.competitions?.[0];
        const homeComp = comp?.competitors?.find((c: any) => c.homeAway === 'home') || comp?.competitors?.[0];
        const awayComp = comp?.competitors?.find((c: any) => c.homeAway === 'away') || comp?.competitors?.[1];

        const state = data.header.status?.type?.state;
        const status: MatchStatus = state === 'in' ? 'live' : (state === 'post' ? 'completed' : 'upcoming');

        const keyEvents: MatchEvent[] = (data.keyEvents || []).map((ev: any) => ({
          id: String(ev.id || Math.random()),
          minute: ev.clock?.displayValue ? `${ev.clock.displayValue}'` : '',
          type: ev.type?.type || 'event',
          team: ev.team?.displayName,
          player: ev.participants?.[0]?.athlete?.displayName || ev.text,
          text: ev.text
        }));

        const details = {
          match: {
            id: matchId,
            sport: 'football' as SportType,
            competition: data.header.league?.name || 'Football League',
            homeTeam: {
              name: homeComp?.team?.displayName || 'Home',
              shortName: homeComp?.team?.abbreviation || 'HOM',
              logo: homeComp?.team?.logos?.[0]?.href,
              score: homeComp?.score,
              isWinner: homeComp?.winner
            },
            awayTeam: {
              name: awayComp?.team?.displayName || 'Away',
              shortName: awayComp?.team?.abbreviation || 'AWY',
              logo: awayComp?.team?.logos?.[0]?.href,
              score: awayComp?.score,
              isWinner: awayComp?.winner
            },
            status,
            statusText: data.header.status?.type?.description || 'Match Details',
            matchTime: comp?.date || new Date().toISOString(),
            venue: data.gameInfo?.venue?.fullName || 'Stadium',
            isVerified: true,
            dataSource: status === 'live' ? 'live_feed' as const : 'verified_archive' as const,
            events: keyEvents
          },
          events: keyEvents,
          stats: data.boxscore?.teams,
          venueInfo: data.gameInfo?.venue ? {
            name: data.gameInfo.venue.fullName,
            city: data.gameInfo.venue.address?.city,
            capacity: data.gameInfo.venue.capacity
          } : undefined
        };

        setCache(cacheKey, details, status === 'live' ? 30 * 1000 : 10 * 60 * 1000);
        return details;
      }
    }
  } else if (matchId.startsWith('bb-')) {
    const eventId = matchId.replace('bb-', '');
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${eventId}`;
    const data = await fetchWithTimeout(url, 4000);
    if (data && data.header) {
      const comp = data.header.competitions?.[0];
      const homeComp = comp?.competitors?.find((c: any) => c.homeAway === 'home') || comp?.competitors?.[0];
      const awayComp = comp?.competitors?.find((c: any) => c.homeAway === 'away') || comp?.competitors?.[1];

      const state = data.header.status?.type?.state;
      const status: MatchStatus = state === 'in' ? 'live' : (state === 'post' ? 'completed' : 'upcoming');

      const details = {
        match: {
          id: matchId,
          sport: 'basketball' as SportType,
          competition: 'NBA',
          homeTeam: {
            name: homeComp?.team?.displayName || 'Home',
            shortName: homeComp?.team?.abbreviation || 'HOM',
            logo: homeComp?.team?.logos?.[0]?.href,
            score: homeComp?.score,
            linescores: homeComp?.linescores?.map((l: any) => String(l.displayValue || '')),
            isWinner: homeComp?.winner
          },
          awayTeam: {
            name: awayComp?.team?.displayName || 'Away',
            shortName: awayComp?.team?.abbreviation || 'AWY',
            logo: awayComp?.team?.logos?.[0]?.href,
            score: awayComp?.score,
            linescores: awayComp?.linescores?.map((l: any) => String(l.displayValue || '')),
            isWinner: awayComp?.winner
          },
          status,
          statusText: data.header.status?.type?.description || 'Final',
          matchTime: comp?.date || new Date().toISOString(),
          venue: data.gameInfo?.venue?.fullName || 'Arena',
          isVerified: true,
          dataSource: status === 'live' ? 'live_feed' as const : 'verified_archive' as const
        },
        venueInfo: data.gameInfo?.venue ? {
          name: data.gameInfo.venue.fullName,
          city: data.gameInfo.venue.address?.city
        } : undefined
      };

      setCache(cacheKey, details, status === 'live' ? 30 * 1000 : 10 * 60 * 1000);
      return details;
    }
  }

  // Default fallback: search in current feed
  const feed = await getLiveSportsFeed({});
  const found = feed.matches.find(m => m.id === matchId);
  return { match: found || null };
}
