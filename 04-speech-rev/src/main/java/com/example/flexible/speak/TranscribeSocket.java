/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.example.flexible.speak;

import com.google.api.gax.rpc.ApiStreamObserver;
import com.google.api.gax.rpc.BidiStreamingCallable;
import com.google.cloud.speech.v1.RecognitionConfig;
import com.google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
import com.google.cloud.speech.v1.SpeechClient;
import com.google.cloud.speech.v1.StreamingRecognitionConfig;
import com.google.cloud.speech.v1.StreamingRecognitionResult;
import com.google.cloud.speech.v1.StreamingRecognizeRequest;
import com.google.cloud.speech.v1.StreamingRecognizeResponse;
import com.google.cloud.speech.v1.SpeechContext; //tommy
import com.google.gson.Gson;
import com.google.protobuf.ByteString;
import io.grpc.auth.ClientAuthInterceptor;
import org.eclipse.jetty.websocket.api.WebSocketAdapter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TranscribeSocket extends WebSocketAdapter
    implements ApiStreamObserver<StreamingRecognizeResponse> {

  private static final Logger logger = Logger.getLogger(TranscribeSocket.class.getName());
  ApiStreamObserver<StreamingRecognizeRequest> requestObserver;
  private Gson gson;
  SpeechClient speech;

  public TranscribeSocket() {
    gson = new Gson();
  }

  /**
   * Called when the client sends this server some raw bytes (ie audio data).
   */
  @Override
  public void onWebSocketBinary(byte[] payload, int offset, int len) {
    if (isConnected()) {
      StreamingRecognizeRequest request =
          StreamingRecognizeRequest.newBuilder()
              .setAudioContent(ByteString.copyFrom(payload, offset, len))
              .build();
      requestObserver.onNext(request);
    }
  }

  /**
   * Called when the client sends this server some text.
   */
  @Override
  public void onWebSocketText(String message) {
    if (isConnected()) {
      Constraints constraints = gson.fromJson(message, Constraints.class);
      logger.info(String.format("Got sampleRate: %s", constraints.sampleRate));
      logger.info(String.format("Got contextWord: %s", constraints.contextWord));
      logger.info(String.format("Got localeOption: %s", constraints.localeOption));
      logger.info(String.format("Got singleUtteranceOption: %s", constraints.singleUtteranceOption));

      try {
        speech = SpeechClient.create();
        BidiStreamingCallable<StreamingRecognizeRequest, StreamingRecognizeResponse> callable =
            speech.streamingRecognizeCallable();

        requestObserver = callable.bidiStreamingCall(this);
        // Build and send a StreamingRecognizeRequest containing the parameters for
        // processing the audio.
/*
        SpeechContext context = //tommy 
             SpeechContext.newBuilder()
            //.addPhrases("Hi Griff")
	    .addPhrases("上平車")
	    .addPhrases("下平車")
	    .addPhrases("AI盤點表")
	    .addPhrases("突波")
	    .addPhrases("數控")
            .build();
*/
	SpeechContext.Builder phrase_builder = SpeechContext.newBuilder();
	//String str = "上平車 , 下平車 , AI盤點表";
	String str = constraints.contextWord;
	String strWords[] = str.split("\\s*,\\s*");
	if( null!=strWords && strWords.length > 0 )
	{
	    for( int i=0; i<strWords.length; i++ ) {
	        phrase_builder.addPhrases(strWords[i]);
	        //logger.info("add context " + strWords[i]);
	    }
	}
	SpeechContext context = phrase_builder.build();

        RecognitionConfig config =
            RecognitionConfig.newBuilder()
            .setEncoding(AudioEncoding.LINEAR16)
            .setSampleRateHertz(constraints.sampleRate)
            //.setLanguageCode("en-US")
            //.setLanguageCode("zh-TW") //tommy
            .setLanguageCode(constraints.localeOption) //tommy
	    .setMaxAlternatives(5)
	    .addSpeechContexts(context)
            .build();
        StreamingRecognitionConfig streamingConfig =
            StreamingRecognitionConfig.newBuilder()
            .setConfig(config)
            .setInterimResults(true)
            //.setSingleUtterance(false)
            //.setSingleUtterance(true) //tommy
            .setSingleUtterance(constraints.singleUtteranceOption)
            .build();

        StreamingRecognizeRequest initial =
            StreamingRecognizeRequest.newBuilder()
	    .setStreamingConfig(streamingConfig)
            .build();
        requestObserver.onNext(initial);

        getRemote().sendString(message);
      } catch (IOException e) {
        logger.log(Level.WARNING, "Error onWebSocketText", e);
      }
    }
  }

  public void closeApiChannel() {
    speech.close();
  }

  /**
   * Called when the connection to the client is closed.
   */
  @Override
  public void onWebSocketClose(int statusCode, String reason) {
    logger.info("Websocket close.\r\n");
    requestObserver.onCompleted();
    closeApiChannel();
  }

  /**
   * Called if there's an error connecting with the client.
   */
  @Override
  public void onWebSocketError(Throwable cause) {
    logger.log(Level.WARNING, "Websocket error", cause);
    requestObserver.onError(cause);
    closeApiChannel();
  }


  /**
   * Called when the Speech API has a transcription result for us.
   */
  @Override
  public void onNext(StreamingRecognizeResponse response) {
    List<StreamingRecognitionResult> results = response.getResultsList();
    if (results.size() < 1) {
      return;
    }

    try {
      StreamingRecognitionResult result = results.get(0);
      logger.info("Got result " + result);
      //logger.info("Got result " + results); //tommy
      //String transcript = result.getAlternatives(0).getTranscript();
/*
      String transcript = result.getAlternatives(0).getTranscript();
      try {
	for (int i = 1; i < 5; i++) {
          transcript += ", " + result.getAlternatives(i).getTranscript();
        }	
      } catch (Exception e) {
      }
      logger.info("Got transcript " + transcript + "\r\n");
*/
      String transcript = "";
      for (int i = 0; i < result.getAlternativesCount(); i++) {
          transcript += "Top " + (i+1) + ": " + result.getAlternatives(i).getTranscript() + "\r\n";
      }
      logger.info("Got transcript of top " + result.getAlternativesCount() + "\r\n" + transcript + "\r\n");	
      getRemote().sendString(gson.toJson(result));
    } catch (IOException e) {
      logger.log(Level.WARNING, "Error sending to websocket", e);
    }
  }

  /**
   * Called if the API call throws an error.
   */
  @Override
  public void onError(Throwable error) {
    logger.log(Level.WARNING, "recognize failed", error);
    // Close the websocket
    getSession().close(500, error.toString());
    closeApiChannel();
  }

  /**
   * Called when the API call is complete.
   */
  @Override
  public void onCompleted() {
    logger.info("recognize completed.");
    // Close the websocket
    getSession().close();
    closeApiChannel();
  }

  // Taken wholesale from StreamingRecognizeClient.java
  private static final List<String> OAUTH2_SCOPES =
      Arrays.asList("https://www.googleapis.com/auth/cloud-platform");
}
