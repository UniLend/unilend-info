import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { Box, Flex, Text } from 'rebass'
import TokenLogo from '../TokenLogo'
import { CustomLink } from '../Link'
import Row from '../Row'
import { Divider } from '..'

import { formattedNum, formattedPercent } from '../../utils'
import { useMedia } from 'react-use'
import { withRouter } from 'react-router-dom'
import { TOKEN_BLACKLIST } from '../../constants'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name releaseRate liq';
  padding: 0 1.125rem;

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol apy releaseRate liq';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 1.5fr 0.6fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol apy releaseRate liq tfl trp';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  text-align: end;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  color: ${({ theme }) => theme.text1} !important;
  @media screen and (max-width: 640px) {
    font-size: 0.85rem;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1} !important;

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 'liq',
  REL_RATE: 'releaseRate',
  APY: 'apy',
  TFL: 'tfl',
  TRP: 'trp',
  VOL_UT: 'oneDayVolumeUT',
  SYMBOL: 'symbol',
  NAME: 'name',
  PRICE: 'priceUSD',
  CHANGE: 'priceChangeUSD',
}

// @TODO rework into virtualized list
function TopTokenList({ tokens, itemMax = 10, useTracked = false }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  const below1080 = useMedia('(max-width: 1080px)')
  const below680 = useMedia('(max-width: 680px)')
  const below600 = useMedia('(max-width: 600px)')

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [tokens])

  const formattedTokens = useMemo(() => {
    return (
      tokens &&
      Object.keys(tokens)
        .filter((key) => {
          return !TOKEN_BLACKLIST.includes(key)
        })
        .map((key) => tokens[key])
    )
  }, [tokens])

  useEffect(() => {
    if (tokens && formattedTokens) {
      let extraPages = 1
      if (formattedTokens.length % itemMax === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(formattedTokens.length / itemMax) + extraPages)
    }
  }, [tokens, formattedTokens, itemMax])

  const filteredList = useMemo(() => {
    return (
      formattedTokens &&
      formattedTokens
        .sort((a, b) => {
          if (sortedColumn === SORT_FIELD.SYMBOL || sortedColumn === SORT_FIELD.NAME) {
            return a[sortedColumn] > b[sortedColumn] ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
          }
          return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        })
        .slice(itemMax * (page - 1), page * itemMax)
    )
  }, [formattedTokens, itemMax, page, sortDirection, sortedColumn])

  const ListItem = ({ item, index }) => {
    return (
      <DashGrid style={{ height: '48px' }} focus={true}>
        <DataText area="name" fontWeight="500">
          <Row>
            {!below680 && <div style={{ marginRight: '1rem', width: '10px' }}>{index}</div>}
            <TokenLogo address={item.id} />
            <CustomLink style={{ marginLeft: '16px', whiteSpace: 'nowrap' }} to={'/token/' + item.id}>
              <FormattedName
                text={below680 ? item.symbol : item.name}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </CustomLink>
          </Row>
        </DataText>
        {!below680 && (
          <>
            <DataText area="symbol" color="text" fontWeight="500">
              <FormattedName text={item.symbol} maxCharacters={5} />
            </DataText>
          </>
        )}
        <DataText area="apy">{formattedNum(item.apy, false)}</DataText>
        <DataText area="releaseRate">{formattedNum(item.releaseRate, false)}</DataText>
        {!below680 && <DataText area="liq">{formattedNum(item.totalLiquidity, false)}</DataText>}
        {!below1080 && (
          // <DataText area="price" color="text" fontWeight="500">
          //   {formattedNum(item.priceUSD, true)}
          // </DataText>
          <>
            <DataText area="tfl">{formattedNum(item.totalFlashLoan, false)}</DataText>
            <DataText area="trp">{formattedNum(item.totalRewardPool, false)}</DataText>
          </>
        )}
        {/* {!below1080 && <DataText area="change">{formattedPercent(item.priceChangeUSD)}</DataText>} */}
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: 'fit-content', padding: '0 1.125rem 1rem 1.125rem' }}>
        <Flex alignItems="center" justifyContent="flexStart">
          <ClickableText
            color="text"
            area="name"
            fontWeight="500"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.NAME)
              setSortDirection(sortedColumn !== SORT_FIELD.NAME ? true : !sortDirection)
            }}
          >
            {below680 ? 'Symbol' : 'Name'} {sortedColumn === SORT_FIELD.NAME ? (!sortDirection ? '???' : '???') : ''}
          </ClickableText>
        </Flex>
        {!below680 && (
          <>
            <Flex alignItems="center">
              <ClickableText
                area="symbol"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.SYMBOL)
                  setSortDirection(sortedColumn !== SORT_FIELD.SYMBOL ? true : !sortDirection)
                }}
              >
                Symbol {sortedColumn === SORT_FIELD.SYMBOL ? (!sortDirection ? '???' : '???') : ''}
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area="apy"
                onClick={() => {
                  setSortedColumn(useTracked ? SORT_FIELD.VOL_UT : SORT_FIELD.APY)
                  setSortDirection(
                    sortedColumn !== (useTracked ? SORT_FIELD.VOL_UT : SORT_FIELD.APY) ? true : !sortDirection
                  )
                }}
              >
                Apy
                {sortedColumn === (useTracked ? SORT_FIELD.VOL_UT : SORT_FIELD.APY) ? (!sortDirection ? '???' : '???') : ''}
              </ClickableText>
            </Flex>
          </>
        )}
        <Flex alignItems="center">
          <ClickableText
            area="releaseRate"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.REL_RATE)
              setSortDirection(sortedColumn !== SORT_FIELD.REL_RATE ? true : !sortDirection)
            }}
          >
            Reward (24hrs) {sortedColumn === SORT_FIELD.REL_RATE ? (!sortDirection ? '???' : '???') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="liq"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '???' : '???') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center">
            <ClickableText
              area="tfl"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.TFL)
                setSortDirection(sortedColumn !== SORT_FIELD.TFL ? true : !sortDirection)
              }}
            >
              FlashLoan {sortedColumn === SORT_FIELD.TFL ? (!sortDirection ? '???' : '???') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center">
            <ClickableText
              area="trp"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.TRP)
                setSortDirection(sortedColumn !== SORT_FIELD.TRP ? true : !sortDirection)
              }}
            >
              Reward Pool
              {sortedColumn === SORT_FIELD.TRP ? (!sortDirection ? '???' : '???') : ''}
            </ClickableText>
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>
        {filteredList &&
          filteredList.map((item, index) => {
            return (
              <div key={index}>
                <ListItem key={index} index={(page - 1) * itemMax + index + 1} item={item} />
                <Divider />
              </div>
            )
          })}
      </List>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>???</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>???</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(TopTokenList)
