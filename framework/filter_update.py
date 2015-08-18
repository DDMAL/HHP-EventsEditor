# -*- coding: utf-8 -*-
import json
import re
from sys import argv
from stanford_corenlp_pywrapper import CoreNLP
script, jar_path, file_path = argv

def process(replacement, candidate):
	for mentions in replacement:
		name = ""
		for mention in mentions:
			mark = "" 
			sentenceLocation = mention[0]
			tokenLocation = mention[1]
			tokenLocationEntry = tokenLocation[0]
			tokenLocationLength = tokenLocation[1] - tokenLocation[0]
			candidateSentence = candidate[sentenceLocation]
			candidateSentenceToken = candidateSentence[0]
			candidateSentenceNER = candidateSentence[1]
			candidateSentencePOS = candidateSentence[2]
			counter = 0;
			if name == "":
				counter = 0
				while (counter < tokenLocationLength):
					if candidateSentenceNER[tokenLocationEntry + counter] == 'PERSON':
						mark += candidateSentenceToken[tokenLocationEntry + counter] + " "
					else:
						mark = ""
					counter += 1
				if not mark == "":
					name = mark.strip()
			else:
				if candidateSentencePOS[tokenLocationEntry] == 'PRP':
					candidateSentenceToken[tokenLocationEntry] = name
					index = 1
					while (index < tokenLocationLength):
						if candidateSentencePOS[tokenLocationEntry + index] == 'PRP':
							candidateSentenceToken[tokenLocationEntry + index] = "??!!!.."
						index += 1
				elif candidateSentencePOS[tokenLocationEntry] == 'PRP$':
					candidateSentenceToken[tokenLocationEntry] = name + "'s"
					index = 1
					while (index < tokenLocationLength):
						if candidateSentencePOS[tokenLocationEntry + index] == 'PRP$':
							candidateSentenceToken[tokenLocationEntry + index] = "??!!!.."
						index += 1
	return 	candidate

def bracketProcess(text):
	left = 0
	right = 0
	charList = list(text)
	outputList = []
	for char in charList:
		preLeft = left
		preRight = right
		if char == '(' or char == '[':
			left += 1
			continue
		elif char == ')' or char == ']':
			right += 1
			continue
		if left == right:
			outputList.append(char)
	output = ''.join(outputList)
	return output


PRPList = ["He", "he", "She", "she", "His", "his", "Her", "him", "her", "him,", "him.", "her,", "her."]
monthElement = "january|february|march|april|may|june|july|august|september|october|november|december"
dateElement = "1|2|3|4|5|6|7|8|9|0"
monthPattern = re.compile(monthElement, re.IGNORECASE)
datePattern = re.compile(dateElement, re.IGNORECASE)

procCOR = CoreNLP("coref", corenlp_jars=[jar_path])
readFile = (open(file_path)).read()
filteredFile = bracketProcess(readFile)
dictCOR = procCOR.parse_doc(filteredFile)
entitiesCOR = dictCOR['entities']
sentencesCOR = dictCOR['sentences']


replaceList = []
for i in entitiesCOR:
	mentionList = i['mentions']
	if not len(mentionList) == 1:
		catchList = []
		for j in mentionList:
			item = [j['sentence']]
			item.append(j['tokspan_in_sentence'])
			catchList.append(item)
		replaceList.append(catchList)

candidateList = []
for i in sentencesCOR:
	addition = []
	tokenList = i['tokens']
	nerList = i['ner']
	posList = i['pos']
	addition.append(tokenList)
	addition.append(nerList)
	addition.append(posList)
	candidateList.append(addition)

filteredOutput = process(replaceList, candidateList)
sentenceOutput = []
for item in filteredOutput:
	tokens = item[0]
	tokenOutput = tokens[0]
	while (tokens.count('??!!!..') > 0):
		tokens.remove('??!!!..')
	for i in tokens[1:]:
		if i == ',' or i =='.':
			tokenOutput += i
		else:
			tokenOutput += ' ' + i
	sentenceOutput.append(tokenOutput)

output = ""
for k in sentenceOutput:
	output += ' ' + k
output = output.encode('utf-8').strip()
outputFile = open("filtered.txt", 'w')
outputFile.write(output)
outputFile.close()

