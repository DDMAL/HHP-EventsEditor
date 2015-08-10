# -*- coding: utf-8 -*-
from sys import argv
from nltk.tag import StanfordNERTagger
from nltk.tag import StanfordPOSTagger
from nltk.tokenize import sent_tokenize
import re
import sys
import logging

reload(sys)  
sys.setdefaultencoding('utf8')
script, filename, loadname = argv
logging.basicConfig(format='preprocess progress:%(message)s', level=logging.INFO)
NERTagger = StanfordNERTagger('english.all.3class.distsim.crf.ser.gz')
POSTagger = StanfordPOSTagger('english-bidirectional-distsim.tagger')
PRPList = ["He", "he", "She", "she", "His", "his", "Her", "him", "her", "him,", "him.", "her,", "her."]
monthElement = "january|february|march|april|may|june|july|august|september|october|november|december"
dateElement = "1|2|3|4|5|6|7|8|9|0"
monthPattern = re.compile(monthElement, re.IGNORECASE)
datePattern = re.compile(dateElement, re.IGNORECASE)

#month: return 1. year for sure: return 2:. correct date: 3. not date 0.
def dateJudge(datePair):
	dateString = datePair[0]
	dateTagger = datePair[1]
	if dateTagger == "CD":
		matchDate = re.findall(datePattern, dateString)
		if len(matchDate) == len(dateString):
			if int(dateString) > 31:
				return 2
			else:
				return 3
	elif dateTagger == "NN" or dateTagger == "FW" or dateTagger == "NNP" or 1:
		matchDate = re.findall(datePattern, dateString)
		matchMonth = re.findall(monthPattern, dateString)
		numSymbol = dateString.count(')') + dateString.count('(') + dateString.count('.') + dateString.count(',') + dateString.count('[')
		if len(matchMonth) > 0:
			return 1
		elif len(matchDate) > 0 and numSymbol > 0 and len(dateString) - len(matchDate) <= 3:
			return 3
		else:
			return 0
	else:
		return 0

def searchPRP(PRP, PRPList):
	pair = PRPList[0]
	if PRP == pair[0]:
		return pair
	elif len(PRPList) == 1:
		return ['','']
	else:
		return searchPRP(PRP,PRPList[1:])

def getName(sentence, tokens):
	NERList = NERTagger.tag(sentence.split())
	logging.info('NER Tagging of a sentence')
	nameConnection = 0
	name = ''
	numName = 0
	countPRP = 0
	PRPCollection = []
	stringPosition = 0
	tokenPosition = 0
	for i in NERList:
		tokenLength = len(i[0])
		PRPTag = 0
		if i[1] == 'PERSON':
			if numName == 0:
				if name == '':
					name = i[0]
				else:
					name += " " + i[0]
				nameConnection = 1
			elif numName > 0:
				name = ''
			elif countPRP > 0:
				name = ''
		elif nameConnection == 1:
			numName += 1
			nameConnection = 0
		elif not PRPList.count(i[0]) == 0:
			nameConnection = 0
			countPRP += PRPList.count(i[0])
			if i[0] == 'her':
				PRPpair = searchPRP(i[0],tokens[tokenPosition:])
				if PRPpair[1] == 'PRP$':
					PRPTag = 1
			elif i[0] == 'Her' or i[0] == 'His' or i[0] == 'his':
				PRPTag = 1
			elif i[0] == 'her.' or i[0] == 'him.':
				PRPTag = 2
			elif i[0] == 'her,' or i[0] == 'him,':
				PRPTag = 3
			PRPCollection.append([i[0], stringPosition + sentence[stringPosition:].find(i[0]), len(i[0]), PRPTag])
		stringPosition += tokenLength + 1
		tokenPosition += 1
	return [name, countPRP, PRPCollection, numName]

def replacePRP(PRPCollection, name, sentence):
	characters = list(sentence)
	collector = []
	output = ''
	position = 0
	for PRP in PRPCollection:
		if PRP[3] == 0:
			collector += characters[position:PRP[1]] + [str(name)]
		elif PRP[3] == 1:
			collector += characters[position:PRP[1]] + [str(name)] + ["'s"]
		elif PRP[3] == 2:
			collector += characters[position:PRP[1]] + [str(name)] + ["."]
		elif PRP[3] == 3:
			collector += characters[position:PRP[1]] + [str(name)] + [","]
		position = PRP[1] + PRP[2]
	collector += characters[position:]
	output = "".join(collector)
	return output

def bracketProcess(sentence, tokens):
	dateLabels = [dateJudge(token) for token in tokens]
	dateBuffer = []
	dateCollector = []
	tokenPosition = 0
	sequence = 0
	datePosition = []
	for i in dateLabels:
		if i > 0:
			tokenSelected = tokens[tokenPosition]
			dateBuffer += [tokenSelected[0]]
			sequence += 1
		elif sequence > 2:
			dateCollector.append(dateBuffer)
			datePosition.append(tokenPosition)
			sequence = 0
			dateBuffer = []
		else:
			sequence = 0
		tokenPosition += 1
	position = 0
	for i in datePosition:
		if position == 0:
			position = i
		elif (i - position) > 4:
			index = datePosition.find(i)
			dateCollector.pop(index)
		else:
			position = i
	if len(dateCollector) == 2:
		return dateCollector
	else:
		return []

def bracketRemove(sentence):
	charList = list(sentence)
	inBracket = 0
	charListCopy = []
	for character in charList:
		if character == '(':
			inBracket += 1
		elif character == ')':
			inBracket -= 1
		elif inBracket == 0:
			charListCopy += character
	output = "".join(charListCopy)
	return output

def getSentences(paragraph):
	sentenceBuffer = sent_tokenize(paragraph)
	numLeftBracketBuffer = 0
	numRightBracketBuffer = 0
	incompleteSentenceBuffer = []
	outputList = []
	for sentence in sentenceBuffer:
		numLeftBracket = sentence.count('(')
		numRightBracket = sentence.count(')')
		if not numLeftBracket == numRightBracket:
			numLeftBracketBuffer += numLeftBracket
			numRightBracketBuffer += numRightBracket
			incompleteSentenceBuffer.append(sentence)
			if numRightBracketBuffer == numLeftBracketBuffer:
				numLeftBracketBuffer = 0
				numRightBracketBuffer = 0
				outputList.append("".join(incompleteSentenceBuffer))
				incompleteSentenceBuffer = []
		elif numLeftBracket == numRightBracket and not incompleteSentenceBuffer == []:
			incompleteSentenceBuffer.append(sentence)
		elif numLeftBracket == numRightBracket and incompleteSentenceBuffer == []:
			outputList.append(sentence)
	return outputList

readFile = (open(filename)).read()
paras = readFile.split('\n')
parasCopy = []
paraIndex = 0
for paragraph in paras:
	paraIndex += 1
	logging.info('Processing paragraph %d' %paraIndex)
	if not paragraph == '':
		name = ''
		paragraphCopy = ""
		sentenceList = getSentences(paragraph)
		sentenceIndex = 0
		for sentence in sentenceList:
			sentenceIndex += 1
			logging.info('Processing sentence %d' %sentenceIndex)
			tokens = POSTagger.tag(sentence.split())
			logging.info('POS Tagging of a sentence')
			nameAnalysis = getName (sentence, tokens)
			sentenceCopy = sentence
			if nameAnalysis[0] == '' and nameAnalysis[1] > 0 and not name == '':
				sentenceCopy = replacePRP(nameAnalysis[2], name, sentence)
			elif not nameAnalysis[0] == '' and nameAnalysis[3] == 1:
				name = nameAnalysis[0]
			if sentenceCopy.count('(') > 0 and not name == '':
				dateBucket = bracketProcess(sentenceCopy, tokens)
				sentenceCopy = bracketRemove(sentenceCopy)
				if not dateBucket == []:
					date_1 = dateBucket[0]
					sentence_1 = name + " was born in"
					for i in date_1:
						sentence_1 += " " + i
					sentence_1 += ". "
					date_2 = dateBucket[1]
					sentence_2 = name + " died in"
					for j in date_2:
						sentence_2 += " " + j
					sentence_2 += ". "
					sentenceCopy += " " + sentence_1
					sentenceCopy += sentence_2
			paragraphCopy += sentenceCopy + ' '
		parasCopy.append(paragraphCopy)
logging.info('Preprocessing finished!')

# Write File
loadFile = open(loadname, 'w')
for i in parasCopy:
	loadFile.write(i)
	loadFile.write("\n")
loadFile.close()

logging.info('Start extraction')
